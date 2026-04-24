export {};

declare module "express-session" {
  interface SessionData {
    webUser?: {
      discordUserId: string;
      isAdmin: boolean;
      isAdminVerifiedAt: number;
    };
    oauthState?: string;
  }
}
