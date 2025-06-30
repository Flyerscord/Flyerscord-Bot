import { ChatInputCommandInteraction } from "discord.js";
import { AdminSlashCommand, PARAM_TYPES } from "@common/models/SlashCommand";
import DaysUntilDB from "../../providers/DaysUtil.Database";
import { events } from "../../models/DaysUntilEvents";
import discord from "@common/utils/discord/discord";

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
    const replies = await discord.interactions.createReplies(interaction, "daysUntil:EnableDisableCommand:execute", true);

    const eventName: string = this.getParamValue(interaction, PARAM_TYPES.STRING, "event");
    const setEnabled: string = this.getParamValue(interaction, PARAM_TYPES.STRING, "setenabled");

    const enable: boolean = setEnabled.toLowerCase() == "enable";

    const db = DaysUntilDB.getInstance();

    const event = Object.values(events).find((event) => event.name == eventName);
    if (event) {
      db.setEventEnabled(event.dbKey, enable);

      replies.reply(`Event ${event.name} ${enable ? "enabled" : "disabled"}!`);
    }
  }
}
