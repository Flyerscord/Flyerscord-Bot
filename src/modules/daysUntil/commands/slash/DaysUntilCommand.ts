import { ChatInputCommandInteraction } from "discord.js";
import SlashCommand, { PARAM_TYPES } from "../../../../common/models/SlashCommand.js";
import events from "../../models/DaysUntilEvents.js";
import DaysUntilDB from "../../providers/DaysUtil.Database";
import Time from "../../../../common/utils/Time.js";

export default class DaysUntilCommand extends SlashCommand {
  constructor() {
    super("daysuntil", "Check the number of days until a certain event");

    this.data.addStringOption((option) => {
      option.setName("event").setDescription("The event to check the number of days until").setRequired(true);

      const db = DaysUntilDB.getInstance();
      for (const key of Object.keys(events)) {
        const event = events[key];
        if (db.getEvent(event.dbKey).enabled) {
          option.addChoices({ name: event.name, value: key });
        }
      }

      return option;
    });
  }

  async execute(interaction: ChatInputCommandInteraction): Promise<void> {
    const eventKey: string = this.getParamValue(interaction, PARAM_TYPES.STRING, "event");

    const event = events[eventKey];

    const db = DaysUntilDB.getInstance();
    const eventData = db.getEvent(event.dbKey);

    const timeUntil = Time.timeUntil(eventData.date);

    let output = "";
    if (timeUntil > 0) {
      output = event.daysUntilMessage.replace("{time}", Time.getFormattedTimeUntil(eventData.date));
    } else if (timeUntil < 0) {
      output = event.pastMessage;
    } else {
      output = event.exactMessage;
    }

    interaction.reply({ content: output });
  }
}
