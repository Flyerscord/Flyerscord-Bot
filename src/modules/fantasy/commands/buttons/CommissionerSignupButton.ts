import { ButtonInteraction, ButtonStyle } from "discord.js";
import ButtonHandler from "@common/models/ButtonHandler";
import ConfigManager from "@common/managers/ConfigManager";
import discord from "@common/utils/discord/discord";
import LevelsDB from "@modules/levels/db/LevelsDB";
import FantasyDB from "../../db/FantasyDB";
import { updateSignupMessage } from "../../utils/signupMessage";

export default class CommissionerSignupButton extends ButtonHandler {
  constructor() {
    super("fantasy_commissioner", "Sign Up As Commissioner", ButtonStyle.Secondary);
  }

  /**
   * Signs the clicking user up as a Fantasy commissioner for the current season.
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

    if (await db.hasCommissionerSignedUp(season.id, interaction.user.id)) {
      await this.replies.reply({ content: "You're already signed up as a commissioner for this Fantasy season!", ephemeral: true });
      return;
    }

    await db.addCommissionerSignup(season.id, interaction.user.id);

    const member = await discord.members.getMember(interaction.user.id);
    if (member) {
      await discord.roles.addRoleToUser(member, config.generalRoleId);
    }

    await this.replies.reply({ content: "You're signed up as a commissioner!", ephemeral: true });

    await updateSignupMessage(season);
  }
}
