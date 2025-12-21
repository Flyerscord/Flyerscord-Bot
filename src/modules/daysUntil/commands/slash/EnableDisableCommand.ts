import { AutocompleteInteraction, ChatInputCommandInteraction } from "discord.js";
import { AdminAutocompleteSlashCommand, OPTION_TYPES, PARAM_TYPES } from "@common/models/SlashCommand";
import { events, getEventNames } from "../../models/DaysUntilEvents";
import DaysUntilDB from "../../db/DaysUntilDB";

export default class EnableDisableCommand extends AdminAutocompleteSlashCommand {
  constructor() {
    super("daysuntiltoggle", "Enable or disable a certain days until event", { ephermal: true });

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

    const db = new DaysUntilDB();

    const event = Object.values(events).find((event) => event.name == eventName);
    if (event) {
      await db.setEventEnabled(event.dbKey, enable);

      await this.replies.reply(`Event ${event.name} ${enable ? "enabled" : "disabled"}!`);
    }
  }

  async getAutoCompleteOptions(interaction: AutocompleteInteraction): Promise<string[] | undefined> {
    const focusedName = this.getFocusedOptionName(interaction);
    const db = new DaysUntilDB();

    if (focusedName == "event") {
      return getEventNames();
    } else if (focusedName == "setenabled") {
      const eventName = this.getOptionValue(interaction, OPTION_TYPES.STRING, "event");
      if (!eventName) return undefined;
      eventName as string;

      const event = Object.values(events).find((event) => event.name == eventName);
      if (event) {
        const enabled = (await db.getEvent(event.dbKey)).enabled;
        return [`${enabled ? "Disable" : "Enable"}`];
      }
    }
    return undefined;
  }
}
