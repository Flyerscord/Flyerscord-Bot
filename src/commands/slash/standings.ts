import { ChatInputCommandInteraction } from "discord.js";

import { PARAM_TYPES, SlashCommand } from "../../models/SlashCommand";
import NHLApi from "../../util/nhlApi";

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
              .setDescription("The division to be displayed. Defaults to Metro")
              .addChoices(
                { name: "Metropolitan", value: "0" },
                { name: "Atlantic", value: "1" },
                { name: "Central", value: "2" },
                { name: "Pacific", value: "3" }
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
              .setDescription("The conference to be displayed. Defaults to East")
              .addChoices({ name: "Eastern", value: "0" }, { name: "Western", value: "1" })
          )
      )
      .addSubcommand((subcommand) =>
        subcommand
          .setName("wildcard")
          .setDescription("Show the wildcard standings")
          .addStringOption((option) =>
            option
              .setName("conference")
              .setDescription("The conference to be displayed. Defaults to East")
              .addChoices({ name: "Eastern", value: "0" }, { name: "Western", value: "1" })
          )
      )
      .addSubcommand((subcommand) => subcommand.setName("league").setDescription("Show the league standings"));
  }

  async execute(interaction: ChatInputCommandInteraction): Promise<void> {
    if (interaction.options.getSubcommand() == "division") {
      const division = parseInt(this.getParamValue(interaction, PARAM_TYPES.STRING, "division") || "0"); // Defaults to Metropolitan
      const res = await NHLApi.get("standings/byDivision");
      if (res.statusCode == 200) {
        const divisionName = res.data.records[division].division.name; //TODO: Move to embeds file
      }
    } else if (interaction.options.getSubcommand() == "conference") {
      const conference = parseInt(this.getParamValue(interaction, PARAM_TYPES.STRING, "conference") || "0"); // Defaults to Eastern
    } else if (interaction.options.getSubcommand() == "wildcard") {
      const conference = parseInt(this.getParamValue(interaction, PARAM_TYPES.STRING, "conference") || "0"); // Defaults to Eastern
    } else if (interaction.options.getSubcommand() == "league") {
    } else {
      interaction.reply({ content: "Error!", ephemeral: true });
    }
  }
}
