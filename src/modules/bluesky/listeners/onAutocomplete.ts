import ClientManager from "@common/managers/ClientManager";
import { AutocompleteInteraction, Interaction } from "discord.js";
import BlueSky from "../utils/BlueSky";

export default (): void => {
  const client = ClientManager.getInstance().client;
  client.on("interactionCreate", async (interaction: Interaction) => {
    if (!interaction.isAutocomplete()) return;

    if (await removeAccount(interaction)) return;
  });
};

async function removeAccount(interaction: AutocompleteInteraction): Promise<boolean> {
  if (interaction.commandName !== "bluesky") {
    return false;
  }

  const subCommand = interaction.options.getSubcommand(false);
  if (subCommand !== "remove") {
    return false;
  }

  const focusedOption = interaction.options.getFocused(true);
  if (focusedOption) {
    if (focusedOption.name == "account") {
      const value = focusedOption.value as string;

      const bk = BlueSky.getInstance();
      try {
        const accounts = await bk.getListAccounts();

        const filteredCommandNames = accounts
          .filter((ele) => ele.userHandle.toLowerCase().startsWith(value.toLowerCase()))
          .map((ele) => ele.userHandle);
        sendAutocompleteOptions(interaction, filteredCommandNames);
        return true;
      } catch {
        return false;
      }
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
