import { Request, Response } from "express";
import { randomUUID } from "node:crypto";
import ConfigManager from "@common/managers/ConfigManager";

export default function oauthStartHandler(req: Request, res: Response): void {
  const config = ConfigManager.getInstance().getConfig("ClaimRole");

  const state = randomUUID();
  req.session.oauthState = state;

  const params = new URLSearchParams({
    client_id: config.clientId,
    redirect_uri: config.callbackUrl,
    response_type: "code",
    scope: "identify",
    state,
  });

  req.session.save(() => {
    res.redirect(`https://discord.com/oauth2/authorize?${params.toString()}`);
  });
}
