import "dotenv/config";
import express from "express";
import session from "express-session";
import path from "node:path";
import { createExpressMiddleware } from "@trpc/server/adapters/express";
import { appRouter } from "./router";
import { createContext } from "./context";
import { exchangeCode, getDiscordUserId } from "./utils/discordOAuth";
import { isUserAdmin } from "./utils/adminCheck";
import { randomUUID } from "node:crypto";

const app = express();
app.set("trust proxy", 1);
app.use(express.json());

app.use(
  session({
    name: "web.sid",
    secret: process.env.WEB_SESSION_SECRET!,
    resave: false,
    saveUninitialized: false,
    cookie: {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      maxAge: 24 * 60 * 60 * 1000,
    },
  }),
);

// OAuth routes
app.get("/auth/discord", (req, res) => {
  const state = randomUUID();
  req.session.oauthState = state;
  req.session.save(() => {
    const params = new URLSearchParams({
      client_id: process.env.WEB_CLIENT_ID!,
      redirect_uri: process.env.WEB_CALLBACK_URL!,
      response_type: "code",
      scope: "identify",
      state,
    });
    res.redirect(`https://discord.com/oauth2/authorize?${params}`);
  });
});

app.get("/auth/callback", async (req, res) => {
  const { code, state } = req.query as { code?: string; state?: string };

  if (!code || !state || state !== req.session.oauthState) {
    res.status(400).send("Invalid OAuth state");
    return;
  }

  try {
    const accessToken = await exchangeCode(code, process.env.WEB_CALLBACK_URL!);
    const userId = await getDiscordUserId(accessToken);
    const admin = await isUserAdmin(userId);

    req.session.oauthState = undefined;
    req.session.webUser = {
      discordUserId: userId,
      isAdmin: admin,
      isAdminVerifiedAt: Date.now(),
    };

    await new Promise<void>((resolve, reject) => req.session.save((err) => (err ? reject(err) : resolve())));
    res.redirect("/");
  } catch {
    res.status(500).send("Authentication failed");
  }
});

// tRPC
app.use(
  "/trpc",
  createExpressMiddleware({
    router: appRouter,
    createContext,
  }),
);

// Health check
app.get("/health", (_req, res) => {
  res.json({ status: "healthy" });
});

// Serve React SPA in production
const clientDist = path.resolve(__dirname, "../../web-client/dist");
app.use(express.static(clientDist));
app.get("*", (_req, res) => {
  res.sendFile(path.join(clientDist, "index.html"));
});

const port = process.env.PORT ?? 4000;
app.listen(port, () => {
  console.log(`Web server running on port ${port}`);
});
