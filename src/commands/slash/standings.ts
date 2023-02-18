import { CommandInteraction } from "discord.js";

import { SlashCommand } from "../../models/SlashCommand";

export default class StandingsCommand extends SlashCommand {
  constructor() {
    super("standings", "Get the league standings");

    this.data
      .addSubcommand((subcommand) =>
        subcommand
          .setName("division")
          .setDescription("Show the division standings")
          .addStringOption((option) =>
            option
              .setName("division")
              .setDescription("The division to be displayed")
              .setRequired(true)
              .addChoices(
                { name: "Metropolitan", value: "metropolitan" },
                { name: "Atlantic", value: "atlantic" },
                { name: "Central", value: "central" },
                { name: "Pacific", value: "pacific" }
              )
          )
      )
      .addSubcommand((subcommand) =>
        subcommand
          .setName("conference")
          .setDescription("Show the conference standings")
          .addStringOption((option) =>
            option
              .setName("conference")
              .setDescription("The conference to be displayed")
              .setRequired(true)
              .addChoices({ name: "Eastern", value: "eastern" }, { name: "Western", value: "western" })
          )
      );
  }

  async execute(interaction: CommandInteraction): Promise<void> {
    interaction.reply({ content: "Pong", ephemeral: true });
  }
}
