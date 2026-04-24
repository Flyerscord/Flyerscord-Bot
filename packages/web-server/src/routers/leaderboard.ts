import { desc } from "drizzle-orm";
import axios from "axios";
import { publicProcedure, router } from "../trpc";
import { db } from "../db";
import { levels } from "../db/schema";

interface IGuildMember {
  user: { id: string; username: string; global_name: string | null; avatar: string | null };
  avatar: string | null;
}

export interface ILeaderboardEntry {
  rank: number;
  userId: string;
  username: string;
  avatarUrl: string | null;
  level: number;
  totalXp: number;
  messageCount: number;
}

let cache: { data: ILeaderboardEntry[]; expiresAt: number } | null = null;
const CACHE_TTL = 60_000;

async function fetchGuildMembers(): Promise<Map<string, IGuildMember>> {
  const guildId = process.env.GUILD_ID!;
  const botToken = process.env.DISCORD_TOKEN!;

  const response = await axios.get<IGuildMember[]>(`https://discord.com/api/v10/guilds/${guildId}/members?limit=1000`, {
    headers: { Authorization: `Bot ${botToken}` },
    timeout: 10_000,
  });

  const map = new Map<string, IGuildMember>();
  for (const member of response.data) {
    map.set(member.user.id, member);
  }
  return map;
}

function getAvatarUrl(member: IGuildMember, guildId: string): string | null {
  if (member.avatar) {
    return `https://cdn.discordapp.com/guilds/${guildId}/users/${member.user.id}/avatars/${member.avatar}.webp?size=64`;
  }
  if (member.user.avatar) {
    return `https://cdn.discordapp.com/avatars/${member.user.id}/${member.user.avatar}.webp?size=64`;
  }
  return null;
}

export const leaderboardRouter = router({
  get: publicProcedure.query(async (): Promise<ILeaderboardEntry[]> => {
    if (cache && Date.now() < cache.expiresAt) {
      return cache.data;
    }

    const [users, members] = await Promise.all([
      db.select().from(levels).orderBy(desc(levels.totalExperience)),
      fetchGuildMembers(),
    ]);

    const guildId = process.env.GUILD_ID!;
    const data: ILeaderboardEntry[] = users.map((user, index) => {
      const member = members.get(user.userId);
      const username = member ? (member.user.global_name ?? member.user.username) : user.userId;
      const avatarUrl = member ? getAvatarUrl(member, guildId) : null;

      return {
        rank: index + 1,
        userId: user.userId,
        username,
        avatarUrl,
        level: user.currentLevel,
        totalXp: user.totalExperience,
        messageCount: user.messageCount,
      };
    });

    cache = { data, expiresAt: Date.now() + CACHE_TTL };
    return data;
  }),
});
