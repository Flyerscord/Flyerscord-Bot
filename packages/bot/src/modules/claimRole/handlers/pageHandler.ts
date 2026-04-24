import { Request, Response } from "express";
import ConfigManager from "@common/managers/ConfigManager";

export default function pageHandler(_req: Request, res: Response): void {
  const config = ConfigManager.getInstance().getConfig("ClaimRole");

  res.send(renderLandingPage(config.inviteUrl));
}

function renderLandingPage(inviteUrl: string): string {
  return `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0" />
  <title>Flyerscord</title>
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
    .logo {
      width: 120px;
      height: 120px;
      object-fit: cover;
      display: block;
      margin: 0 auto 1.5rem;
      border-radius: 50%;
      clip-path: circle(50%);
    }
    h1 { font-size: 1.75rem; margin-bottom: 0.5rem; }
    p { color: #b9bbbe; margin-bottom: 2rem; line-height: 1.5; }
    .btn {
      display: block;
      width: 100%;
      padding: 0.875rem 1.5rem;
      border-radius: 10px;
      font-size: 1rem;
      font-weight: 600;
      text-decoration: none;
      cursor: pointer;
      transition: opacity 0.15s, transform 0.1s;
      margin-bottom: 0.75rem;
    }
    .btn:last-child { margin-bottom: 0; }
    .btn:hover { opacity: 0.88; transform: translateY(-1px); }
    .btn:active { transform: translateY(0); opacity: 0.75; }
    .btn-join { background: #5865f2; color: #fff; }
    .btn-role { background: #3ba55d; color: #fff; }
  </style>
</head>
<body>
  <div class="card">
    <img src="https://ik.imagekit.io/flyerzrule/server-logo.gif" alt="Gritty" class="logo" />
    <h1>Hi there!</h1>
    <p>Thank you for being a part of the <strong>First Official Flyerscord Meetup</strong>!<br>You can claim your <strong>special</strong> role below, or join the server if you aren't already a part of it.</p>
    <a href="${inviteUrl}" class="btn btn-join">Join Flyerscord</a>
    <a href="/claim/auth" class="btn btn-role">Claim Your Special Role!</a>
  </div>
</body>
</html>`;
}
