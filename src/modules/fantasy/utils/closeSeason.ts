import { Guild, Role } from "discord.js";
import Stumper from "stumper";
import ConfigManager from "@common/managers/ConfigManager";
import discord from "@common/utils/discord/discord";
import { getGuild } from "@common/utils/discord/guilds";
import FantasyDB from "../db/FantasyDB";
import { FantasySignup, SeasonStatus, SkillLevel, VALID_TEAM_SIZES } from "../db/schema";
import { BlockedSkillLevel, getBlockedWarningEmbed, getPendingApprovalEmbed, getResultsEmbed, TeamRosterResult } from "./Embeds";

/**
 * Randomizes the order of an array using the Fisher-Yates algorithm.
 * @returns a new shuffled array; the input array is not mutated
 */
function shuffle<T>(items: T[]): T[] {
  const shuffled = [...items];
  for (let i = shuffled.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
  }
  return shuffled;
}

/**
 * Team sizes each skill level prefers, in priority order (most-preferred first). Sizes outside this
 * list are still used as a fallback if no combination of preferred sizes sums to the signup total, so
 * e.g. an Expert skill level can still fall back to an 8-player team if that's the only way to split
 * an odd-shaped signup count, but `computeTeamSizes` avoids it unless required.
 */
const SKILL_LEVEL_PREFERRED_TEAM_SIZES: Record<SkillLevel, readonly number[]> = {
  [SkillLevel.BEGINNER]: [10, 8],
  [SkillLevel.INTERMEDIATE]: [10, 12],
  [SkillLevel.EXPERT]: [12, 14, 16],
};

/**
 * Recursively searches for a set of team sizes (drawn from `sizesByPriority`, each usable any number
 * of times) that sums exactly to `total`, trying to use as many of the highest-priority size as
 * possible before falling back to lower-priority sizes for the remainder.
 * @returns the chosen team sizes (e.g. [10, 10, 8]), or undefined if no combination sums exactly to `total`
 */
function solveTeamSizes(sizesByPriority: readonly number[], total: number): number[] | undefined {
  const [size, ...rest] = sizesByPriority;

  if (rest.length === 0) {
    return total % size === 0 ? Array(total / size).fill(size) : undefined;
  }

  for (let count = Math.floor(total / size); count >= 0; count--) {
    const remainder = solveTeamSizes(rest, total - count * size);
    if (remainder) {
      return [...Array(count).fill(size), ...remainder];
    }
  }

  return undefined;
}

/**
 * Splits a skill level's signup total into a set of team sizes, preferring that skill level's
 * preferred sizes (see `SKILL_LEVEL_PREFERRED_TEAM_SIZES`) and only reaching for other valid sizes if
 * no combination of preferred sizes works. Teams within a skill level don't have to be the same size.
 * @returns the chosen team sizes (e.g. [10, 10, 8]), or undefined if no combination of valid team
 * sizes sums exactly to the signup total
 */
export function computeTeamSizes(signupCount: number, skillLevel: SkillLevel): number[] | undefined {
  const preferred = SKILL_LEVEL_PREFERRED_TEAM_SIZES[skillLevel];
  const preferredResult = solveTeamSizes(preferred, signupCount);
  if (preferredResult) {
    return preferredResult;
  }

  const fallbackSizes = [...preferred, ...VALID_TEAM_SIZES.filter((size) => !preferred.includes(size))];
  return solveTeamSizes(fallbackSizes, signupCount);
}

/**
 * Formats a team's canonical Discord role name. The team number is omitted when it's the only team
 * for that skill level.
 */
function getTeamRoleName(skillLevel: SkillLevel, teamNumber: number, totalTeams: number): string {
  return totalTeams === 1 ? `Fantasy ${skillLevel} League` : `Fantasy ${skillLevel} League ${teamNumber}`;
}

/**
 * Finds an existing guild role by exact name, or creates it if none exists yet.
 */
async function getOrCreateTeamRole(guild: Guild, roleName: string): Promise<Role> {
  const existing = guild.roles.cache.find((role) => role.name === roleName);
  if (existing) {
    return existing;
  }

  Stumper.info(`Creating Fantasy team role "${roleName}"`, "fantasy:closeSeason:getOrCreateTeamRole");
  return guild.roles.create({ name: roleName });
}

/**
 * Wipes a team's Discord role from all current holders, then grants it to the newly assigned roster,
 * creating the role first if it doesn't exist yet.
 */
async function finalizeTeamRoles(guild: Guild, roleName: string, assignedUserIds: string[]): Promise<void> {
  const role = await getOrCreateTeamRole(guild, roleName);

  for (const member of role.members.values()) {
    await discord.roles.removeRoleFromUser(member, role.id);
  }

  for (const userId of assignedUserIds) {
    const member = await discord.members.getMember(userId);
    if (!member) {
      Stumper.warning(`Could not find member ${userId} while assigning role "${roleName}"`, "fantasy:closeSeason:finalizeTeamRoles");
      continue;
    }
    await discord.roles.addRoleToUser(member, role.id);
  }
}

/**
 * Shuffles a skill level's unassigned signups and deals them into teams sized by `computeTeamSizes`,
 * persisting the assignment on each signup. Does nothing if no valid team-size combination exists for
 * the signup count.
 * @returns details about why the skill level was blocked, or undefined if it was finalized (or had
 * nothing to finalize)
 */
async function finalizeSkillLevel(db: FantasyDB, seasonId: number, skillLevel: SkillLevel): Promise<BlockedSkillLevel | undefined> {
  const unassigned = await db.getUnassignedSignupsBySkillLevel(seasonId, skillLevel);
  if (unassigned.length === 0) {
    return undefined;
  }

  const teamSizes = computeTeamSizes(unassigned.length, skillLevel);
  if (!teamSizes) {
    return { skillLevel, signupCount: unassigned.length };
  }

  const shuffled = shuffle(unassigned);
  let offset = 0;
  for (let teamNumber = 1; teamNumber <= teamSizes.length; teamNumber++) {
    const size = teamSizes[teamNumber - 1];
    const teamSignups: FantasySignup[] = shuffled.slice(offset, offset + size);
    offset += size;

    for (const signup of teamSignups) {
      await db.assignSignupToTeam(signup.id, teamNumber);
    }
  }

  return undefined;
}

/**
 * Builds the current per-team rosters for a season from already-assigned signups, using each team's
 * custom name if one was set, otherwise its canonical role name.
 */
async function getFinalizedTeamRosters(db: FantasyDB, seasonId: number): Promise<TeamRosterResult[]> {
  const finalizedTeams: TeamRosterResult[] = [];

  for (const skillLevel of Object.values(SkillLevel)) {
    const totalTeams = await db.getMaxAssignedTeamNumber(seasonId, skillLevel);

    for (let teamNumber = 1; teamNumber <= totalTeams; teamNumber++) {
      const teamSignups = await db.getSignupsByTeam(seasonId, skillLevel, teamNumber);
      if (teamSignups.length === 0) {
        continue;
      }

      const roleName = getTeamRoleName(skillLevel, teamNumber, totalTeams);
      const customName = await db.getTeamName(seasonId, skillLevel, teamNumber);

      finalizedTeams.push({
        skillLevel,
        teamNumber,
        roleName,
        label: customName ?? roleName,
        userIds: teamSignups.map((signup) => signup.userId),
      });
    }
  }

  return finalizedTeams;
}

/**
 * Grants the commissioner role to everyone who signed up as a commissioner this season. Additive
 * only: existing holders of the role are never removed.
 * @returns the user IDs of the commissioners
 */
async function grantCommissionerRoles(db: FantasyDB, seasonId: number, commissionerRoleId: string): Promise<string[]> {
  const commissioners = await db.getCommissionerSignups(seasonId);

  for (const commissioner of commissioners) {
    const member = await discord.members.getMember(commissioner.userId);
    if (!member) {
      Stumper.warning(`Could not find commissioner member ${commissioner.userId}`, "fantasy:closeSeason:grantCommissionerRoles");
      continue;
    }
    await discord.roles.addRoleToUser(member, commissionerRoleId);
  }

  return commissioners.map((c) => c.userId);
}

/**
 * Checks that the commissioner role still exists in the guild, since (unlike team roles) it's not
 * auto-created.
 * @returns a human-readable label for the missing role, or an empty array if it exists (or isn't needed)
 */
async function findMissingCommissionerRole(commissionerCount: number, commissionerRoleId: string): Promise<string[]> {
  if (commissionerCount === 0) {
    return [];
  }

  if (await discord.roles.roleExists(commissionerRoleId)) {
    return [];
  }

  return [`Commissioner (role ID ${commissionerRoleId})`];
}

/**
 * Finalizes as many skill levels of a season as currently have a valid team-size combination for
 * their signup total, then posts the proposed rosters to the admin channel for
 * approval. Does NOT create or assign any Discord roles; that only happens once an admin runs
 * `/fantasyseason approve`. Safe to call repeatedly (e.g. after `/fantasyseason move` fixes an
 * unsplittable count). Callers triggering this before the season's deadline are responsible for
 * cancelling `SeasonCloseTask` themselves.
 */
export async function closeSeason(seasonId: number): Promise<void> {
  const db = new FantasyDB();
  const season = await db.getSeasonById(seasonId);
  if (!season || season.status === SeasonStatus.PENDING_APPROVAL || season.status === SeasonStatus.CLOSED) {
    return;
  }

  if (season.status === SeasonStatus.OPEN) {
    await db.setSeasonStatus(seasonId, SeasonStatus.CLOSING);
  }

  const config = ConfigManager.getInstance().getConfig("Fantasy");

  const blocked: BlockedSkillLevel[] = [];
  for (const skillLevel of Object.values(SkillLevel)) {
    const result = await finalizeSkillLevel(db, seasonId, skillLevel);
    if (result) {
      blocked.push(result);
    }
  }

  if (blocked.length > 0) {
    Stumper.info(`Fantasy season ${seasonId} close blocked on ${blocked.length} skill level(s)`, "fantasy:closeSeason:closeSeason");
    await discord.messages.sendEmbedToChannel(config.adminChannelId, getBlockedWarningEmbed(blocked));
    return;
  }

  await db.setSeasonStatus(seasonId, SeasonStatus.PENDING_APPROVAL);

  const proposedTeams = await getFinalizedTeamRosters(db, seasonId);
  const commissioners = await db.getCommissionerSignups(seasonId);
  const missingRoles = await findMissingCommissionerRole(commissioners.length, config.commissionerRoleId);

  await discord.messages.sendEmbedToChannel(config.adminChannelId, getPendingApprovalEmbed(proposedTeams, missingRoles));
  Stumper.success(`Fantasy season ${seasonId} rosters proposed, awaiting admin approval`, "fantasy:closeSeason:closeSeason");
}

export type ApplyApprovedRolesResult = { status: "not_pending" } | { status: "missing_roles"; missing: string[] } | { status: "approved" };

/**
 * Creates/finds each team's Discord role, assigns roles for a season's approved rosters (team roles +
 * commissioner role), marks the season closed, and posts the public results embed. Only valid while
 * the season is pending approval. Refuses to run if the commissioner role no longer exists, so the
 * season doesn't get partially finalized.
 */
export async function applyApprovedRoles(seasonId: number): Promise<ApplyApprovedRolesResult> {
  const db = new FantasyDB();
  const season = await db.getSeasonById(seasonId);
  if (!season || season.status !== SeasonStatus.PENDING_APPROVAL) {
    return { status: "not_pending" };
  }

  const config = ConfigManager.getInstance().getConfig("Fantasy");

  const finalizedTeams = await getFinalizedTeamRosters(db, seasonId);
  const commissioners = await db.getCommissionerSignups(seasonId);

  const missing = await findMissingCommissionerRole(commissioners.length, config.commissionerRoleId);
  if (missing.length > 0) {
    return { status: "missing_roles", missing };
  }

  const guild = getGuild();
  if (!guild) {
    Stumper.error(`Could not find guild while approving Fantasy season ${seasonId}`, "fantasy:closeSeason:applyApprovedRoles");
    return { status: "missing_roles", missing: ["Could not find the configured Discord guild"] };
  }

  for (const { roleName, userIds } of finalizedTeams) {
    await finalizeTeamRoles(guild, roleName, userIds);
  }

  const commissionerUserIds = await grantCommissionerRoles(db, seasonId, config.commissionerRoleId);

  await db.setSeasonStatus(seasonId, SeasonStatus.CLOSED);

  await discord.messages.sendEmbedToChannel(config.signupChannelId, getResultsEmbed(finalizedTeams, commissionerUserIds));
  Stumper.success(`Fantasy season ${seasonId} approved, roles assigned, and closed`, "fantasy:closeSeason:applyApprovedRoles");
  return { status: "approved" };
}
