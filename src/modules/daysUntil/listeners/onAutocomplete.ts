import { Interaction } from "discord.js";
import ClientManager from "../../../common/managers/ClientManager";
import { AutocompleteInteraction } from "discord.js";
import DaysUntilDB from "../providers/DaysUtil.Database";
import events, { getEventNames, getKeyByName } from "../models/DaysUntilEvents";
import IDaysUntilEvent from "../interfaces/IDaysUntilEvent";

export default (): void => {
  ClientManager.getInstance().client.on("interactionCreate", async (interaction: Interaction) => {
    if (!interaction.isAutocomplete()) return;

    const inter = interaction as AutocompleteInteraction;

    if (await toggleCommand(inter)) return;
  });
};

async function toggleCommand(interaction: AutocompleteInteraction): Promise<boolean> {
  if (interaction.commandName != "daysuntiltoggle") return false;
  const db = DaysUntilDB.getInstance();

  const options = interaction.options.data;

  const focusedOption = options.find((option) => option.focused);

  if (focusedOption) {
    if (focusedOption.name == "event") {
      const eventNames = getEventNames();
      const value = focusedOption.value as string;
      const filteredEventNames = eventNames.filter((name) => name.toLowerCase().startsWith(value.toLowerCase()));
      sendAutocompleteOptions(interaction, filteredEventNames);
      return true;
    } else if (focusedOption.name == "setenabled") {
      if (options.filter((option) => option.name == "event").length == 1) {
        const eventName = options.find((option) => option.name == "event")?.value as string;

        const key = getKeyByName(eventName);
        if (key) {
          const event: IDaysUntilEvent = events[key];
          const enabled = db.getEvent(event.dbKey).enabled;

          sendAutocompleteOptions(interaction, [`${enabled ? "Disable" : "Enable"}`]);
          return true;
        }
      }
    }
  }

  return false;
}

async function sendAutocompleteOptions(interaction: AutocompleteInteraction, options: Array<string>): Promise<void> {
  if (options.length > 25) {
    options = options.slice(0, 24);
  }
  await interaction.respond(options.map((option) => ({ name: option, value: option })));
}
