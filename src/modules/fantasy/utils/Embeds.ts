import { EmbedBuilder, time, TimestampStyles } from "discord.js";
import { FantasySeason, SkillLevel } from "../db/schema";

/**
 * Builds the embed posted alongside the signup buttons, showing current signup counts per skill
 * level and the signup deadline. There's no capacity shown; team counts and sizes are computed from
 * the final signup totals once signups close.
 */
export function getSignupEmbed(season: FantasySeason, signupCountsBySkillLevel: Record<SkillLevel, number>, commissionerCount: number): EmbedBuilder {
  const embed = new EmbedBuilder().setTitle("Fantasy Signups Are Open!").setColor("Blurple");

  const lines = Object.values(SkillLevel).map((skillLevel) => `**${skillLevel}**: ${signupCountsBySkillLevel[skillLevel]} signed up`);
  lines.push(`**Commissioners**: ${commissionerCount} signed up`);

  embed.setDescription(
    `Click a button below to sign up for a skill level. Once you're signed up, you can also sign up to be a commissioner. Click "Leave" to remove your signup.\n\n` +
      `⚠️ **Only sign up if you're serious about playing.** Make sure you have role mentions enabled for this server, since there will be more announcements after signups close. If you sign up and then go MIA, it messes up the team you were placed on, and you risk a warning or ban.\n\n` +
      `${lines.join("\n")}\n\nSignups close: ${time(season.signupDeadline, TimestampStyles.RelativeTime)}`,
  );

  return embed;
}

export interface BlockedSkillLevel {
  skillLevel: SkillLevel;
  signupCount: number;
}

/**
 * Builds the embed posted to the admin channel when one or more skill levels can't be finalized,
 * explaining why and pointing at `/fantasyseason move`.
 */
export function getBlockedWarningEmbed(blocked: BlockedSkillLevel[]): EmbedBuilder {
  const embed = new EmbedBuilder().setTitle("Fantasy Season Close Needs Attention").setColor("Yellow");

  const lines = blocked.map(
    (b) =>
      `**${b.skillLevel}**: ${b.signupCount} signed up, but no combination of valid team sizes adds up to that. ` +
      `Use \`/fantasyseason move\` to move a player to or from this skill level before it can be finalized.`,
  );

  embed.setDescription(lines.join("\n\n"));
  return embed;
}

export interface TeamRosterResult {
  skillLevel: SkillLevel;
  teamNumber: number;
  roleName: string;
  label: string;
  userIds: string[];
}

/**
 * Groups team rosters by skill level into embed fields, shared by the pending-approval and results embeds.
 */
function buildRosterFields(finalizedTeams: TeamRosterResult[]): { name: string; value: string }[] {
  const bySkillLevel = new Map<SkillLevel, TeamRosterResult[]>();
  for (const result of finalizedTeams) {
    const list = bySkillLevel.get(result.skillLevel) ?? [];
    list.push(result);
    bySkillLevel.set(result.skillLevel, list);
  }

  const fields: { name: string; value: string }[] = [];
  for (const [skillLevel, teams] of bySkillLevel) {
    const teamLines = teams
      .sort((a, b) => a.teamNumber - b.teamNumber)
      .map((result) => {
        const roster = result.userIds.map((userId) => `<@${userId}>`).join(", ");
        return `**${result.label}**\n${roster}`;
      });

    fields.push({ name: skillLevel, value: teamLines.join("\n\n") });
  }

  return fields;
}

/**
 * Builds the embed posted to the admin channel with proposed rosters awaiting `/fantasyseason approve`,
 * including a warning field if the commissioner role no longer exists (team roles are auto-created).
 */
export function getPendingApprovalEmbed(proposedTeams: TeamRosterResult[], missingRoles: string[]): EmbedBuilder {
  const embed = new EmbedBuilder()
    .setTitle("Fantasy Season Rosters Pending Approval")
    .setColor(missingRoles.length > 0 ? "Red" : "Orange")
    .setDescription("Review the proposed rosters below. Run `/fantasyseason approve` to assign roles and post the public results.")
    .addFields(buildRosterFields(proposedTeams));

  if (missingRoles.length > 0) {
    embed.addFields({
      name: "⚠️ Missing Roles: Create These Before Approving",
      value: missingRoles.map((role) => `- ${role}`).join("\n"),
    });
  }

  return embed;
}

/**
 * Builds the public embed posted after a season is approved and closed, listing final team rosters
 * and commissioners.
 */
export function getResultsEmbed(finalizedTeams: TeamRosterResult[], commissionerUserIds: string[]): EmbedBuilder {
  const embed = new EmbedBuilder().setTitle("Fantasy Season Results").setColor("Green").addFields(buildRosterFields(finalizedTeams));

  if (commissionerUserIds.length > 0) {
    embed.addFields({ name: "Commissioners", value: commissionerUserIds.map((userId) => `<@${userId}>`).join(", ") });
  }

  return embed;
}
