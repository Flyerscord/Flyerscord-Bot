import { ChatInputCommandInteraction } from "discord.js";
import moment from "moment";

import { SlashCommand } from "../../models/SlashCommand";

export default class DaysUntilCommand extends SlashCommand {
  constructor() {
    super("daysutil", "Check the number of days until a certain event");

    this.data.addSubcommand((subcommand) =>
      subcommand.setName("tradedeadline").setDescription("The number of days until the trade deadline")
    );
  }

  async execute(interaction: ChatInputCommandInteraction): Promise<void> {
    if (interaction.options.getSubcommand() == "tradedeadline") {
      interaction.reply({ content: this.getTimeUntil("NHL Trade Deadline", "2023-3-03 15:00:00") });
    } else {
      interaction.reply({ content: "Invalid command!", ephemeral: true });
    }
  }

  private getTimeUntil(type: string, dateOfEvent: string): string {
    const startDate = moment();
    const endDate = moment(dateOfEvent, "YYYY-M-DD HH:mm:ss");
    const secondsDiff = endDate.diff(startDate, "seconds");

    if (secondsDiff <= 0) {
      return `The **${type}** has started!`;
    } else {
      const secondsInDay = 60 * 60 * 24;
      const secondsInHour = 60 * 60;
      const secondsInMinute = 60;

      let remainder = 0;
      let days = 0;
      let hours = 0;
      let minutes = 0;
      let seconds = 0;

      const stringHeader = `The **${type}** starts in`;

      days = Math.floor(secondsDiff / secondsInDay);
      remainder = secondsDiff - days * secondsInDay;

      hours = Math.floor(remainder / secondsInHour);
      remainder = remainder - hours * secondsInHour;

      minutes = Math.floor(remainder / secondsInMinute);
      seconds = remainder - minutes * secondsInMinute;

      if (days > 0) {
        return `${stringHeader} ${days} days, ${hours} hours, ${minutes} minutes, and ${seconds} seconds!`;
      } else {
        if (hours > 0) {
          return `${stringHeader} ${hours} hours, ${minutes} minutes, and ${seconds} seconds!`;
        } else {
          if (minutes > 0) {
            return `${stringHeader} ${minutes} minutes and ${seconds} seconds!`;
          } else {
            return `${stringHeader} ${seconds} seconds!`;
          }
        }
      }
    }
  }
}
