import { ChatInputCommandInteraction } from "discord.js";
import { AdminSlashCommand, PARAM_TYPES } from "../../../../common/models/SlashCommand";
import DaysUntilDB from "../../providers/DaysUtil.Database";
import events from "../../models/DaysUntilEvents";
import Time from "../../../../common/utils/Time";

export default class ChangeCommand extends AdminSlashCommand {
  constructor() {
    super("change", "Change the event to get the number of days until");

    this.data
      .addStringOption((option) => {
        option.setName("event").setDescription("The event to check the number of days until").setRequired(true);

        const db = DaysUntilDB.getInstance();
        for (const key of Object.keys(events)) {
          const event = events[key];
          if (db.getEvent(event.dbKey).enabled) {
            option.addChoices({ name: event.name, value: key });
          }
        }

        return option;
      })
      .addStringOption((option) =>
        option.setName("date").setDescription("The date to set the event to. Format: MM/DD/YYYY HH:MM:SS (24 hour time)").setRequired(true),
      );
  }

  async execute(interaction: ChatInputCommandInteraction): Promise<void> {
    const dateStr = this.getParamValue(interaction, PARAM_TYPES.STRING, "date");
    const eventKey: string = this.getParamValue(interaction, PARAM_TYPES.STRING, "event");

    const event = events[eventKey];

    const date = Time.getDateFromString(dateStr);
    if (!date) {
      interaction.reply({ content: "Error parsing date!", ephemeral: true });
      return;
    }

    const db = DaysUntilDB.getInstance();

    db.setEventDate(event.dbKey, date.getTime());

    interaction.reply({ content: `Event ${event.name} date set to ${dateStr}!`, ephemeral: true });
  }
}
