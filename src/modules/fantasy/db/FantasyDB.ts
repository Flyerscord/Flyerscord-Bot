import { ModuleDatabase } from "@common/models/ModuleDatabase";
import { and, count, eq, isNull, max, or } from "drizzle-orm";
import {
  fantasyCommissionerSignups,
  fantasySeasons,
  fantasySignups,
  fantasyTeamNames,
  FantasyCommissionerSignup,
  FantasySeason,
  FantasySignup,
  SeasonStatus,
  SkillLevel,
} from "./schema";

export default class FantasyDB extends ModuleDatabase {
  constructor() {
    super("Fantasy");
  }

  // Seasons

  /**
   * Gets the season admins are currently working with: the open season if one exists, otherwise
   * whichever season is mid-close (closing or pending approval).
   */
  async getCurrentSeason(): Promise<FantasySeason | undefined> {
    const openSeason = await this.getOpenSeason();
    if (openSeason) {
      return openSeason;
    }

    return this.getSingleRow<FantasySeason>(
      fantasySeasons,
      or(eq(fantasySeasons.status, SeasonStatus.CLOSING), eq(fantasySeasons.status, SeasonStatus.PENDING_APPROVAL))!,
    );
  }

  async getOpenSeason(): Promise<FantasySeason | undefined> {
    return this.getSingleRow<FantasySeason>(fantasySeasons, eq(fantasySeasons.status, SeasonStatus.OPEN));
  }

  async getSeasonById(id: number): Promise<FantasySeason | undefined> {
    return this.getSingleRow<FantasySeason>(fantasySeasons, eq(fantasySeasons.id, id));
  }

  /**
   * Creates a new open season with the given signup deadline.
   */
  async createSeason(signupDeadline: Date): Promise<FantasySeason> {
    const inserted = await this.db.insert(fantasySeasons).values({ signupDeadline }).returning();
    return inserted[0];
  }

  /**
   * Records which channel and message the season's signup embed was posted to.
   */
  async setSeasonSignupMessage(seasonId: number, signupChannelId: string, signupMessageId: string): Promise<void> {
    await this.db.update(fantasySeasons).set({ signupChannelId, signupMessageId }).where(eq(fantasySeasons.id, seasonId));
  }

  /**
   * Updates a season's status, stamping `closedAt` when transitioning to closed.
   */
  async setSeasonStatus(seasonId: number, status: SeasonStatus): Promise<void> {
    const values: Partial<FantasySeason> = { status };
    if (status === SeasonStatus.CLOSED) {
      values.closedAt = new Date();
    }
    await this.db.update(fantasySeasons).set(values).where(eq(fantasySeasons.id, seasonId));
  }

  /**
   * Deletes a season and all of its signups, commissioner signups, and team names. Does not touch
   * Discord state (roles, the posted signup message); callers are responsible for that.
   */
  async deleteSeason(seasonId: number): Promise<void> {
    await this.db.delete(fantasySignups).where(eq(fantasySignups.seasonId, seasonId));
    await this.db.delete(fantasyCommissionerSignups).where(eq(fantasyCommissionerSignups.seasonId, seasonId));
    await this.db.delete(fantasyTeamNames).where(eq(fantasyTeamNames.seasonId, seasonId));
    await this.db.delete(fantasySeasons).where(eq(fantasySeasons.id, seasonId));
  }

  // Signups

  async hasSignedUp(seasonId: number, userId: string): Promise<boolean> {
    return this.select1(fantasySignups, and(eq(fantasySignups.seasonId, seasonId), eq(fantasySignups.userId, userId))!);
  }

  async getSignup(seasonId: number, userId: string): Promise<FantasySignup | undefined> {
    return this.getSingleRow<FantasySignup>(fantasySignups, and(eq(fantasySignups.seasonId, seasonId), eq(fantasySignups.userId, userId))!);
  }

  /**
   * Signs a user up for a skill level in a season. Relying on the DB's unique `(seasonId, userId)`
   * constraint is what enforces "one skill group per user".
   */
  async addSignup(seasonId: number, userId: string, skillLevel: SkillLevel): Promise<FantasySignup> {
    const inserted = await this.db.insert(fantasySignups).values({ seasonId, userId, skillLevel }).returning();
    return inserted[0];
  }

  async countSignupsBySkillLevel(seasonId: number, skillLevel: SkillLevel): Promise<number> {
    const result = await this.db
      .select({ count: count() })
      .from(fantasySignups)
      .where(and(eq(fantasySignups.seasonId, seasonId), eq(fantasySignups.skillLevel, skillLevel)));
    return result[0]?.count ?? 0;
  }

  /**
   * Gets a skill level's signups that haven't yet been assigned to a team (i.e. not yet finalized).
   */
  async getUnassignedSignupsBySkillLevel(seasonId: number, skillLevel: SkillLevel): Promise<FantasySignup[]> {
    return this.db
      .select()
      .from(fantasySignups)
      .where(and(eq(fantasySignups.seasonId, seasonId), eq(fantasySignups.skillLevel, skillLevel), isNull(fantasySignups.assignedTeamNumber)));
  }

  /**
   * Gets a team's roster for a specific season. Teams are identified by (seasonId, skillLevel,
   * teamNumber) rather than a persistent ID, since they're computed fresh from signup totals at
   * close time instead of being pre-registered.
   */
  async getSignupsByTeam(seasonId: number, skillLevel: SkillLevel, teamNumber: number): Promise<FantasySignup[]> {
    return this.db
      .select()
      .from(fantasySignups)
      .where(
        and(eq(fantasySignups.seasonId, seasonId), eq(fantasySignups.skillLevel, skillLevel), eq(fantasySignups.assignedTeamNumber, teamNumber)),
      );
  }

  async getAllSignupsForSeason(seasonId: number): Promise<FantasySignup[]> {
    return this.db.select().from(fantasySignups).where(eq(fantasySignups.seasonId, seasonId));
  }

  async assignSignupToTeam(signupId: number, teamNumber: number): Promise<void> {
    await this.db.update(fantasySignups).set({ assignedTeamNumber: teamNumber }).where(eq(fantasySignups.id, signupId));
  }

  /**
   * Gets the highest team number assigned within a season's skill level, i.e. how many teams it was
   * finalized into.
   * @returns 0 if the skill level has no assigned teams
   */
  async getMaxAssignedTeamNumber(seasonId: number, skillLevel: SkillLevel): Promise<number> {
    const result = await this.db
      .select({ maxNumber: max(fantasySignups.assignedTeamNumber) })
      .from(fantasySignups)
      .where(and(eq(fantasySignups.seasonId, seasonId), eq(fantasySignups.skillLevel, skillLevel)));
    return Number(result[0]?.maxNumber ?? 0);
  }

  /**
   * Moves a user's signup to a different skill level. Only allowed while the signup has not yet
   * been assigned to a team (i.e. before a season close has finalized that skill level).
   * @returns true if the signup was moved, false if no eligible signup was found
   */
  async moveSignupSkillLevel(seasonId: number, userId: string, newSkillLevel: SkillLevel): Promise<boolean> {
    const updated = await this.db
      .update(fantasySignups)
      .set({ skillLevel: newSkillLevel })
      .where(and(eq(fantasySignups.seasonId, seasonId), eq(fantasySignups.userId, userId), isNull(fantasySignups.assignedTeamNumber)))
      .returning();
    return updated.length > 0;
  }

  /**
   * Removes a user's skill-level signup. Only allowed while it hasn't yet been assigned to a team.
   * @returns true if a signup was removed, false if none existed (or it was already assigned)
   */
  async removeSignup(seasonId: number, userId: string): Promise<boolean> {
    const deleted = await this.db
      .delete(fantasySignups)
      .where(and(eq(fantasySignups.seasonId, seasonId), eq(fantasySignups.userId, userId), isNull(fantasySignups.assignedTeamNumber)))
      .returning();
    return deleted.length > 0;
  }

  // Commissioner Signups

  async hasCommissionerSignedUp(seasonId: number, userId: string): Promise<boolean> {
    return this.select1(
      fantasyCommissionerSignups,
      and(eq(fantasyCommissionerSignups.seasonId, seasonId), eq(fantasyCommissionerSignups.userId, userId))!,
    );
  }

  /**
   * Signs a user up as a commissioner for a season.
   */
  async addCommissionerSignup(seasonId: number, userId: string): Promise<void> {
    await this.db.insert(fantasyCommissionerSignups).values({ seasonId, userId });
  }

  async getCommissionerSignups(seasonId: number): Promise<FantasyCommissionerSignup[]> {
    return this.db.select().from(fantasyCommissionerSignups).where(eq(fantasyCommissionerSignups.seasonId, seasonId));
  }

  /**
   * Removes a user's commissioner signup.
   * @returns true if a signup was removed, false if none existed
   */
  async removeCommissionerSignup(seasonId: number, userId: string): Promise<boolean> {
    const deleted = await this.db
      .delete(fantasyCommissionerSignups)
      .where(and(eq(fantasyCommissionerSignups.seasonId, seasonId), eq(fantasyCommissionerSignups.userId, userId)))
      .returning();
    return deleted.length > 0;
  }

  // Team Names

  async getTeamName(seasonId: number, skillLevel: SkillLevel, teamNumber: number): Promise<string | undefined> {
    const row = await this.getSingleRowWithFields(
      fantasyTeamNames,
      and(eq(fantasyTeamNames.seasonId, seasonId), eq(fantasyTeamNames.skillLevel, skillLevel), eq(fantasyTeamNames.teamNumber, teamNumber))!,
      { customName: fantasyTeamNames.customName },
    );
    return row?.customName;
  }

  /**
   * Sets a team's custom display name for a season, overwriting any previous name for that team.
   */
  async setTeamName(seasonId: number, skillLevel: SkillLevel, teamNumber: number, customName: string): Promise<void> {
    await this.db
      .insert(fantasyTeamNames)
      .values({ seasonId, skillLevel, teamNumber, customName })
      .onConflictDoUpdate({
        target: [fantasyTeamNames.seasonId, fantasyTeamNames.skillLevel, fantasyTeamNames.teamNumber],
        set: { customName },
      });
  }
}
