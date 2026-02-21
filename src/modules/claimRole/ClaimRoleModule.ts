import Module, { IModuleConfigSchema } from "@common/models/Module";
import ExpressManager from "@common/managers/ExpressManager";
import Zod from "@common/utils/ZodWrapper";
import session from "express-session";
import ConfigManager from "@common/managers/ConfigManager";
import EnvManager from "@common/managers/EnvManager";
import pageHandler from "./handlers/pageHandler";
import oauthStartHandler from "./handlers/oauthStartHandler";
import oauthCallbackHandler from "./handlers/oauthCallbackHandler";

export const claimRoleConfigSchema = [
  {
    key: "inviteUrl",
    description: "Discord invite URL shown on the claim role landing page",
    required: true,
    secret: false,
    requiresRestart: false,
    defaultValue: "",
    schema: Zod.string(),
  },
  {
    key: "roleId",
    description: "The ID of the role to grant to eligible users",
    required: true,
    secret: false,
    requiresRestart: false,
    defaultValue: "",
    schema: Zod.string(),
  },
  {
    key: "clientId",
    description: "Discord OAuth2 application client ID",
    required: true,
    secret: true,
    requiresRestart: true,
    defaultValue: "",
    schema: Zod.encryptedString(),
  },
  {
    key: "clientSecret",
    description: "Discord OAuth2 application client secret",
    required: true,
    secret: true,
    requiresRestart: true,
    defaultValue: "",
    schema: Zod.encryptedString(),
  },
  {
    key: "callbackUrl",
    description: "Full public URL for the OAuth2 callback endpoint (e.g. https://example.com/claim/auth/callback)",
    required: true,
    secret: true,
    requiresRestart: true,
    defaultValue: "",
    schema: Zod.encryptedString(),
  },
  {
    key: "sessionSecret",
    description: "Secret used to sign session cookies",
    required: true,
    secret: true,
    requiresRestart: true,
    defaultValue: "",
    schema: Zod.encryptedString(),
  },
] as const satisfies readonly IModuleConfigSchema[];

export default class ClaimRoleModule extends Module {
  protected readonly CONFIG_SCHEMA = claimRoleConfigSchema;

  constructor() {
    super("ClaimRole");
  }

  protected async setup(): Promise<void> {
    const expressManager = ExpressManager.getInstance();
    const config = ConfigManager.getInstance().getConfig("ClaimRole");

    expressManager.addMiddleware(
      session({
        secret: config.sessionSecret,
        resave: false,
        saveUninitialized: false,
        cookie: { secure: EnvManager.getInstance().get("PRODUCTION_MODE"), httpOnly: true, maxAge: 10 * 60 * 1000 },
      }),
    );

    expressManager.addRoute("/claim", pageHandler);
    expressManager.addRoute("/claim/auth", oauthStartHandler);
    expressManager.addRoute("/claim/auth/callback", oauthCallbackHandler);
  }

  protected async cleanup(): Promise<void> {}
}
