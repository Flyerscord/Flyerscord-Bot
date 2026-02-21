import { Request, Response } from "express";
import Stumper from "stumper";
import ConfigManager from "@common/managers/ConfigManager";
import { getGuild } from "@common/utils/discord/guilds";
import { exchangeCode, getDiscordUserId } from "../utils/discordOAuth";
import MyAuditLog from "@common/utils/MyAuditLog";

export default async function oauthCallbackHandler(req: Request, res: Response): Promise<void> {
  const { code, state } = req.query;

  if (!state || typeof state !== "string" || !req.session.oauthState || state !== req.session.oauthState) {
    res.status(400).send(renderResult("Invalid Request", "Session expired or invalid request. Please try again.", false));
    return;
  }

  req.session.oauthState = undefined;

  if (!code || typeof code !== "string") {
    res.status(400).send(renderResult("Error", "No authorization code received.", false));
    return;
  }

  try {
    const config = ConfigManager.getInstance().getConfig("ClaimRole");

    const accessToken = await exchangeCode(code, config.clientId, config.clientSecret, config.callbackUrl);
    const userId = await getDiscordUserId(accessToken);

    const guild = getGuild();
    if (!guild) {
      res.status(500).send(renderResult("Server Error", "Could not connect to the server. Please try again later.", false));
      return;
    }

    const member = await guild.members.fetch(userId);

    if (member.roles.cache.has(config.roleId)) {
      res.send(renderResult("Already Claimed", "You already have this role!", true));
      return;
    }

    await member.roles.add(config.roleId);

    void MyAuditLog.createAuditLog("ClaimRole", {
      action: "RoleGranted",
      userId: userId,
      details: { roleId: config.roleId },
    });

    res.send(renderResult("Success!", "Your role has been added. Welcome to the community!", true));
  } catch (error) {
    Stumper.caughtError(error, "claimRole:oauthCallbackHandler");
    res.status(500).send(renderResult("Error", "An unexpected error occurred. Please try again later.", false));
  }
}

function renderResult(title: string, message: string, success: boolean): string {
  const accentColor = success ? "#3ba55d" : "#ed4245";
  const icon = success ? "✅" : "❌";

  return `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0" />
  <title>Flyerscord — ${title}</title>
  <style>
    *, *::before, *::after { box-sizing: border-box; margin: 0; padding: 0; }
    body {
      min-height: 100vh;
      display: flex;
      align-items: center;
      justify-content: center;
      background: #1a1b1e;
      font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif;
      color: #fff;
      padding: 1rem;
    }
    .card {
      background: #2c2f33;
      border-radius: 16px;
      padding: 2.5rem 2rem;
      max-width: 400px;
      width: 100%;
      text-align: center;
      box-shadow: 0 8px 32px rgba(0,0,0,0.4);
    }
    .icon { font-size: 3rem; margin-bottom: 1rem; }
    h1 { font-size: 1.75rem; margin-bottom: 0.75rem; color: ${accentColor}; }
    p { color: #b9bbbe; margin-bottom: 2rem; line-height: 1.5; }
    .btn {
      display: inline-block;
      padding: 0.75rem 2rem;
      border-radius: 10px;
      font-size: 1rem;
      font-weight: 600;
      text-decoration: none;
      background: #5865f2;
      color: #fff;
      transition: opacity 0.15s;
    }
    .btn:hover { opacity: 0.88; }
  </style>
</head>
<body>
  <div class="card">
    <div class="icon">${icon}</div>
    <h1>${title}</h1>
    <p>${message}</p>
    <a href="/claim" class="btn">Back to Home</a>
  </div>
</body>
</html>`;
}
