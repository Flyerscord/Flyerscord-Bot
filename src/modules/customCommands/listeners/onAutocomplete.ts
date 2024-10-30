import ClientManager from "../../../common/managers/ClientManager";
import { AutocompleteInteraction, Interaction } from "discord.js";
import CustomCommandsDB from "../providers/CustomCommands.Database";

export default (): void => {
  const client = ClientManager.getInstance().client;
  client.on("interactionCreate", async (interaction: Interaction) => {
    if (!interaction.isAutocomplete()) return;

    if (await removeCommand(interaction)) return;
  });
};

async function removeCommand(interaction: AutocompleteInteraction): Promise<boolean> {
  if (interaction.commandName != "customremove" && interaction.commandName != "custominfo" && interaction.commandName != "customedit") return false;

  const focusedOption = interaction.options.getFocused(true);
  if (focusedOption) {
    if (focusedOption.name == "name") {
      const value = focusedOption.value as string;

      const db = CustomCommandsDB.getInstance();
      const commandNames = db.getAllCommandNames();

      const filteredCommandNames = commandNames.filter((name) => name.toLowerCase().startsWith(value.toLowerCase()));
      sendAutocompleteOptions(interaction, filteredCommandNames);
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
