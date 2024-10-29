import { ChatInputCommandInteraction } from "discord.js";
import { AdminSlashCommand, PARAM_TYPES } from "../../../../common/models/SlashCommand.js";
import DaysUntilDB from "../../providers/DaysUtil.Database.js";
import events, { getKeyByName } from "../../models/DaysUntilEvents.js";

export default class EnableDisableCommand extends AdminSlashCommand {
  constructor() {
    super("daysuntiltoggle", "Enable or disable a certain days until event");

    this.data
      .addStringOption((option) => option.setName("event").setDescription("The event to enable or disable").setRequired(true).setAutocomplete(true))
      .addStringOption((option) =>
        option.setName("setenabled").setDescription("Whether or not to enable or disable the event").setRequired(true).setAutocomplete(true),
      );
  }

  async execute(interaction: ChatInputCommandInteraction): Promise<void> {
    const eventName: string = this.getParamValue(interaction, PARAM_TYPES.STRING, "event");
    const setEnabled: string = this.getParamValue(interaction, PARAM_TYPES.STRING, "setenabled");

    const enable: boolean = setEnabled.toLowerCase() == "enable";

    const db = DaysUntilDB.getInstance();

    const key = getKeyByName(eventName);
    if (key) {
      const event = events[key];
      db.setEventEnabled(event.dbKey, enable);

      interaction.reply({
        content: `Event ${event.name} ${enable ? "enabled" : "disabled"}!`,
        ephemeral: true,
      });
    }
  }
}
