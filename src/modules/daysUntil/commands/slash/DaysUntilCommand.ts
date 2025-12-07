import { ChatInputCommandInteraction } from "discord.js";
import SlashCommand, { PARAM_TYPES } from "@common/models/SlashCommand";
import { events } from "../../models/DaysUntilEvents";
import Time from "@common/utils/Time";
import DaysUntilDB from "../../db/DaysUntilDB";

export default class DaysUntilCommand extends SlashCommand {
  constructor() {
    super("daysuntil", "Check the number of days until a certain event");

    this.data.addStringOption((option) =>
      option.setName("event").setDescription("The event to check the number of days until").setRequired(true).setAutocomplete(true),
    );
  }

  async execute(interaction: ChatInputCommandInteraction): Promise<void> {
    const eventKey: string = this.getParamValue(interaction, PARAM_TYPES.STRING, "event");

    const event = Object.values(events).find((event) => event.name == eventKey);

    if (!event) {
      this.replies.reply({ content: "Error finding event!", ephemeral: true });
      return;
    }

    const db = new DaysUntilDB();
    const eventData = await db.getEvent(event.dbKey);

    let timeUntil = -1;
    if (eventData.date) {
      timeUntil = Time.timeUntil(eventData.date.getTime());
    }

    let output = "";
    if (timeUntil > 0) {
      output = event.daysUntilMessage.replace("{time}", Time.getFormattedTimeUntil(timeUntil));
    } else if (timeUntil < 0) {
      output = event.pastMessage;
    } else {
      output = event.exactMessage;
    }

    this.replies.reply(output);
  }
}
