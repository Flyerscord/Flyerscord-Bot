import { ButtonInteraction, ButtonStyle } from "discord.js";
import ButtonHandler from "@common/models/ButtonHandler";
import ConfigManager from "@common/managers/ConfigManager";
import discord from "@common/utils/discord/discord";
import LevelsDB from "@modules/levels/db/LevelsDB";
import FantasyDB from "../../../db/FantasyDB";
import { SkillLevel } from "../../../db/schema";
import { updateSignupMessage } from "../../../utils/signupMessage";

/**
 * Shared behavior for the per-skill-level signup buttons (`BeginnerSignupButton`,
 * `IntermediateSignupButton`, `ExpertSignupButton`). Each subclass just supplies its skill level and
 * button style; the customId and label are derived from the skill level automatically.
 */
export default abstract class SkillLevelSignupButtonBase extends ButtonHandler {
  protected readonly skillLevel: SkillLevel;

  constructor(skillLevel: SkillLevel, style: ButtonStyle) {
    super(`fantasy_signup_${skillLevel.toLowerCase()}`, skillLevel, style);
    this.skillLevel = skillLevel;
  }

  /**
   * Signs the clicking user up for this skill level, after checking the level gate. If they're
   * already signed up for a different skill level, moves them instead of rejecting: a user can only
   * be in one skill pool at a time. There's no capacity limit; teams and their sizes are computed
   * from the final signup totals once the season closes.
   */
  protected async execute(interaction: ButtonInteraction): Promise<void> {
    const db = new FantasyDB();
    const season = await db.getOpenSeason();
    if (!season) {
      await this.replies.reply({ content: "Fantasy signups are not currently open!", ephemeral: true });
      return;
    }

    const config = ConfigManager.getInstance().getConfig("Fantasy");
    const levelsUser = await new LevelsDB().getUser(interaction.user.id);
    if (!levelsUser || levelsUser.currentLevel < config.minLevel) {
      await this.replies.reply({ content: `You must be at least level ${config.minLevel} to sign up for Fantasy!`, ephemeral: true });
      return;
    }

    const existingSignup = await db.getSignup(season.id, interaction.user.id);
    if (existingSignup?.skillLevel === this.skillLevel) {
      await this.replies.reply({ content: `You're already signed up for ${this.skillLevel}!`, ephemeral: true });
      return;
    }

    if (existingSignup) {
      const moved = await db.moveSignupSkillLevel(season.id, interaction.user.id, this.skillLevel);
      if (!moved) {
        await this.replies.reply({ content: "Could not switch your signup, please contact an admin.", ephemeral: true });
        return;
      }
      await this.replies.reply({ content: `Moved you from ${existingSignup.skillLevel} to ${this.skillLevel}!`, ephemeral: true });
    } else {
      await db.addSignup(season.id, interaction.user.id, this.skillLevel);
      await this.replies.reply({ content: `You're signed up for ${this.skillLevel}!`, ephemeral: true });
    }

    const member = await discord.members.getMember(interaction.user.id);
    if (member) {
      await discord.roles.addRoleToUser(member, config.generalRoleId);
    }

    await updateSignupMessage(season);
  }
}
