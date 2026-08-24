import discord from "@common/utils/discord/discord";
import FantasyDB from "../db/FantasyDB";
import { FantasySeason, SkillLevel } from "../db/schema";
import { getSignupEmbed } from "./Embeds";

/**
 * Re-fetches current signup counts and edits the season's posted signup embed in place, so the
 * displayed counts stay live as people sign up, switch, or leave. No-op if the season hasn't posted
 * its signup message yet.
 */
export async function updateSignupMessage(season: FantasySeason): Promise<void> {
  if (!season.signupChannelId || !season.signupMessageId) {
    return;
  }

  const db = new FantasyDB();
  const signupCountsBySkillLevel = {} as Record<SkillLevel, number>;
  for (const skillLevel of Object.values(SkillLevel)) {
    signupCountsBySkillLevel[skillLevel] = await db.countSignupsBySkillLevel(season.id, skillLevel);
  }
  const commissionerCount = (await db.getCommissionerSignups(season.id)).length;

  await discord.messages.updateMessageWithEmbed(
    season.signupChannelId,
    season.signupMessageId,
    getSignupEmbed(season, signupCountsBySkillLevel, commissionerCount),
  );
}
