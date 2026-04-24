import axios from "axios";

interface IGuildMember {
  roles: string[];
}

const FIVE_MINUTES = 5 * 60 * 1000;

export async function isUserAdmin(userId: string): Promise<boolean> {
  const guildId = process.env.GUILD_ID!;
  const adminRoleId = process.env.ADMIN_ROLE_ID!;
  const botToken = process.env.DISCORD_TOKEN!;

  const response = await axios.get<IGuildMember>(`https://discord.com/api/v10/guilds/${guildId}/members/${userId}`, {
    headers: { Authorization: `Bot ${botToken}` },
    timeout: 10_000,
  });

  return response.data.roles.includes(adminRoleId);
}

export function isAdminCacheStale(verifiedAt: number): boolean {
  return Date.now() - verifiedAt > FIVE_MINUTES;
}
