import axios from "axios";

interface IDiscordTokenResponse {
  access_token: string;
}

interface IDiscordUserResponse {
  id: string;
}

export async function exchangeCode(code: string, clientId: string, clientSecret: string, redirectUri: string): Promise<string> {
  const params = new URLSearchParams({
    client_id: clientId,
    client_secret: clientSecret,
    grant_type: "authorization_code",
    code,
    redirect_uri: redirectUri,
  });

  const response = await axios.post<IDiscordTokenResponse>("https://discord.com/api/oauth2/token", params.toString(), {
    headers: { "Content-Type": "application/x-www-form-urlencoded" },
  });

  return response.data.access_token;
}

export async function getDiscordUserId(accessToken: string): Promise<string> {
  const response = await axios.get<IDiscordUserResponse>("https://discord.com/api/users/@me", {
    headers: { Authorization: `Bearer ${accessToken}` },
  });

  return response.data.id;
}
