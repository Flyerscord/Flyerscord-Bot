import { ChatInputCommandInteraction } from "discord.js";
import SlashCommand, { PARAM_TYPES } from "@common/models/SlashCommand";
import { events } from "../../models/DaysUntilEvents";
import DaysUntilDB from "../../providers/DaysUtil.Database";
import Time from "@common/utils/Time";
import discord from "@common/utils/discord/discord";

export default class DaysUntilCommand extends SlashCommand {
  constructor() {
    super("daysuntil", "Check the number of days until a certain event");

    this.data.addStringOption((option) =>
      option.setName("event").setDescription("The event to check the number of days until").setRequired(true).setAutocomplete(true),
    );
  }

  async execute(interaction: ChatInputCommandInteraction): Promise<void> {
    const replies = await discord.interactions.createReplies(interaction, "customCommands:InfoCommand:execute");

    const eventKey: string = this.getParamValue(interaction, PARAM_TYPES.STRING, "event");

    const event = Object.values(events).find((event) => event.name == eventKey);

    if (!event) {
      await replies.reply({ content: "Error finding event!", ephemeral: true });
      return;
    }

    const db = DaysUntilDB.getInstance();
    const eventData = db.getEvent(event.dbKey);

    const timeUntil = Time.timeUntil(eventData.date);

    let output = "";
    if (timeUntil > 0) {
      output = event.daysUntilMessage.replace("{time}", Time.getFormattedTimeUntil(timeUntil));
    } else if (timeUntil < 0) {
      output = event.pastMessage;
    } else {
      output = event.exactMessage;
    }

    await replies.reply(output);
  }
}
