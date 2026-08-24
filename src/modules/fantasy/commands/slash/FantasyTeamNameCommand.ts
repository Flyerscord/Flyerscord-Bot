import { ChatInputCommandInteraction } from "discord.js";
import SlashCommand from "@common/models/SlashCommand";
import FantasyDB from "../../db/FantasyDB";

export default class FantasyTeamNameCommand extends SlashCommand {
  constructor() {
    super("fantasyteamname", "Set your Fantasy team's display name", { ephemeral: true });

    this.data.addStringOption((option) => option.setName("name").setDescription("The name to give your team").setRequired(true).setMaxLength(255));
  }

  /**
   * Sets the calling user's team's custom display name for the current season. Only works once teams
   * have been finalized (signups closed and proposed), since team identity doesn't exist before then.
   */
  async execute(interaction: ChatInputCommandInteraction): Promise<void> {
    const db = new FantasyDB();
    const season = await db.getCurrentSeason();
    if (!season) {
      await this.replies.reply({ content: "There is no active Fantasy season!", ephemeral: true });
      return;
    }

    const signup = await db.getSignup(season.id, interaction.user.id);
    if (!signup || signup.assignedTeamNumber === null) {
      await this.replies.reply({
        content: "You're not on a Fantasy team this season yet, teams are assigned once signups close.",
        ephemeral: true,
      });
      return;
    }

    const name = this.getStringParamValue(interaction, "name");
    await db.setTeamName(season.id, signup.skillLevel, signup.assignedTeamNumber, name);
    await this.replies.reply(`Team name set to: ${name}`);
  }
}
