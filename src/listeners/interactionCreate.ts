import { Interaction, Client } from "discord.js";

import Stumper from "stumper";

export default (client: Client): void => {
  client.on("interactionCreate", async (interaction: Interaction) => {
    if (!interaction.isCommand()) return;

    const command = client.slashCommands.get(interaction.commandName);
    if (!command) return;
    try {
      Stumper.info(`Running command: ${interaction.commandName}`, "interactionCreate");
      await command.execute(interaction);
    } catch (error) {
      if (error) Stumper.error(error);
      await interaction.reply({
        content: "There was an error while executing this command!",
        ephemeral: true,
      });
    }
  });
};
