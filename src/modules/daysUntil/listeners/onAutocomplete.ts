import { Interaction } from "discord.js";
import ClientManager from "../../../common/managers/ClientManager";
import { AutocompleteInteraction } from "discord.js";
import DaysUntilDB from "../providers/DaysUtil.Database";
import { events, getEventNames } from "../models/DaysUntilEvents";

export default (): void => {
  const client = ClientManager.getInstance().client;
  client.on("interactionCreate", async (interaction: Interaction) => {
    if (!interaction.isAutocomplete()) return;

    if (await toggleCommand(interaction)) return;
    if (await changeCommand(interaction)) return;
    if (await normalCommand(interaction)) return;
  });
};

async function toggleCommand(interaction: AutocompleteInteraction): Promise<boolean> {
  if (interaction.commandName != "daysuntiltoggle") return false;
  const db = DaysUntilDB.getInstance();

  const options = interaction.options.data;
  const focusedOption = interaction.options.getFocused(true);

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

        const event = Object.values(events).find((event) => event.name == eventName);
        if (event) {
          const enabled = db.getEvent(event.dbKey).enabled;

          sendAutocompleteOptions(interaction, [`${enabled ? "Disable" : "Enable"}`]);
          return true;
        }
      }
    }
  }

  return false;
}

async function changeCommand(interaction: AutocompleteInteraction): Promise<boolean> {
  if (interaction.commandName != "daysuntilchange") return false;
  const focusedOption = interaction.options.getFocused(true);

  if (focusedOption) {
    if (focusedOption.name == "event") {
      const eventNames = getEventNames();
      const value = focusedOption.value as string;
      const filteredEventNames = eventNames.filter((name) => name.toLowerCase().startsWith(value.toLowerCase()));
      sendAutocompleteOptions(interaction, filteredEventNames);
      return true;
    }
  }

  return false;
}

async function normalCommand(interaction: AutocompleteInteraction): Promise<boolean> {
  if (interaction.commandName != "daysuntil") return false;

  const focusedOption = interaction.options.getFocused(true);
  const db = DaysUntilDB.getInstance();
  const enabledEventKeys = db.getEnabledEventNames();
  const enabledEventNames = enabledEventKeys.map((key) => events[key].name);

  if (focusedOption) {
    if (focusedOption.name == "event") {
      const value = focusedOption.value as string;
      const filteredEventNames = enabledEventNames.filter((name) => name.toLowerCase().startsWith(value.toLowerCase()));
      sendAutocompleteOptions(interaction, filteredEventNames);
      return true;
    }
  }
  return false;
}

async function sendAutocompleteOptions(interaction: AutocompleteInteraction, options: string[]): Promise<void> {
  if (options.length > 25) {
    options = options.slice(0, 24);
  }
  await interaction.respond(options.map((option) => ({ name: option, value: option })));
}
