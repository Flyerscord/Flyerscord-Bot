import { ChatInputCommandInteraction } from "discord.js";
import { AdminSlashCommand, PARAM_TYPES } from "@common/models/SlashCommand";
import { events } from "../../models/DaysUntilEvents";
import Time from "@common/utils/Time";
import DaysUntilDB from "../../db/DaysUntilDB";

export default class ChangeCommand extends AdminSlashCommand {
  constructor() {
    super("daysuntilchange", "Change the event to get the number of days until", { ephermal: true });

    this.data
      .addStringOption((option) =>
        option.setName("event").setDescription("The event to check the number of days until").setRequired(true).setAutocomplete(true),
      )
      .addStringOption((option) =>
        option.setName("date").setDescription("The date to set the event to. Format: MM/DD/YYYY HH:MM:SS (24 hour time)").setRequired(true),
      );
  }

  async execute(interaction: ChatInputCommandInteraction): Promise<void> {
    const dateStr = this.getParamValue(interaction, PARAM_TYPES.STRING, "date");
    const eventKey: string = this.getParamValue(interaction, PARAM_TYPES.STRING, "event");

    const event = Object.values(events).find((event) => event.name == eventKey);
    if (!event) {
      this.replies.reply("Error finding event!");
      return;
    }

    const date = Time.getDateFromString(dateStr);
    if (!date) {
      this.replies.reply("Error parsing date!");
      return;
    }

    const db = new DaysUntilDB();

    await db.setEventDate(event.dbKey, date);

    this.replies.reply(`Event ${event.name} date set to ${dateStr}!`);
  }
}
