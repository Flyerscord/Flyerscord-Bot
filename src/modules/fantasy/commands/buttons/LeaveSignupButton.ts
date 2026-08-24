import { ButtonInteraction } from "discord.js";
import ButtonHandler from "@common/models/ButtonHandler";
import ConfigManager from "@common/managers/ConfigManager";
import discord from "@common/utils/discord/discord";
import FantasyDB from "../../db/FantasyDB";
import { updateSignupMessage } from "../../utils/signupMessage";

export default class LeaveSignupButton extends ButtonHandler {
  constructor() {
    super("fantasy_leave", true);
  }

  /**
   * Removes the clicking user's skill-level and/or commissioner signup for the current season. Skill
   * signups can only be removed before teams are finalized. Revokes the general Fantasy role if the
   * user has no signup of either kind left afterward.
   */
  protected async execute(interaction: ButtonInteraction): Promise<void> {
    const db = new FantasyDB();
    const season = await db.getOpenSeason();
    if (!season) {
      await this.replies.reply({ content: "Fantasy signups are not currently open!", ephemeral: true });
      return;
    }

    const existingSignup = await db.getSignup(season.id, interaction.user.id);
    let removedSkillLevel: string | undefined;
    if (existingSignup && (await db.removeSignup(season.id, interaction.user.id))) {
      removedSkillLevel = existingSignup.skillLevel;
    }

    const removedCommissioner = await db.removeCommissionerSignup(season.id, interaction.user.id);

    if (!removedSkillLevel && !removedCommissioner) {
      if (existingSignup) {
        await this.replies.reply({ content: "Teams have already been finalized, so your signup can't be removed.", ephemeral: true });
      } else {
        await this.replies.reply({ content: "You're not signed up for Fantasy this season!", ephemeral: true });
      }
      return;
    }

    const removedParts = [
      removedSkillLevel ? `your ${removedSkillLevel} signup` : undefined,
      removedCommissioner ? "your commissioner signup" : undefined,
    ].filter((part): part is string => part !== undefined);
    await this.replies.reply({ content: `Removed ${removedParts.join(" and ")}.`, ephemeral: true });

    const stillSignedUp =
      (await db.hasSignedUp(season.id, interaction.user.id)) || (await db.hasCommissionerSignedUp(season.id, interaction.user.id));
    if (!stillSignedUp) {
      const config = ConfigManager.getInstance().getConfig("Fantasy");
      const member = await discord.members.getMember(interaction.user.id);
      if (member) {
        await discord.roles.removeRoleFromUser(member, config.generalRoleId);
      }
    }

    await updateSignupMessage(season);
  }
}
