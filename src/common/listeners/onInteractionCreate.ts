import {
  Interaction,
  Client,
  ModalSubmitInteraction,
  ChatInputCommandInteraction,
  UserContextMenuCommandInteraction,
  MessageContextMenuCommandInteraction,
  CommandInteraction,
  ApplicationCommandType,
} from "discord.js";

import Stumper from "stumper";
import ModalMenu from "../models/ModalMenu";
import { MessageContextMenuCommand, UserContextMenuCommand } from "../models/ContextMenuCommand";

export default (client: Client): void => {
  client.on("interactionCreate", async (interaction: Interaction) => {
    if (interaction instanceof CommandInteraction && interaction.replied) {
      Stumper.error(`Interaction ${interaction.id} is already replied! This should never happen!`, "common:onInteractionCreate:onInteractionCreate");
      return;
    }

    await onSlashCommand(client, interaction as ChatInputCommandInteraction);
    await onModalSubmit(client, interaction as ModalSubmitInteraction);
    await onUserContextMenuCommand(client, interaction as UserContextMenuCommandInteraction);
    await onMessageContextMenuCommand(client, interaction as MessageContextMenuCommandInteraction);
  });
};

async function onSlashCommand(client: Client, interaction: ChatInputCommandInteraction): Promise<void> {
  if (!interaction.isCommand()) return;

  const command = client.slashCommands.get(interaction.commandName);
  if (!command) return;
  try {
    Stumper.info(`Running command: ${interaction.commandName} User: ${interaction.user.id}`, "common:onInteractionCreate:onSlashCommand");
    await command.execute(interaction);
  } catch (error) {
    Stumper.caughtError(error, "common:onInteractionCreate:onSlashCommand");
    if (!interaction.replied) {
      await interaction.followUp({
        content: "There was an error while executing this command!",
        ephemeral: true,
      });
    }
  }
}

async function onModalSubmit(client: Client, interaction: ModalSubmitInteraction): Promise<void> {
  if (!interaction.isModalSubmit()) return;

  const modal: ModalMenu | undefined = client.modals.get(interaction.customId);
  if (!modal) return;
  try {
    Stumper.info(`Running modal submit for ${modal.id}`, "common:onInteractionCreate:onModalSubmit");
    await modal.execute(interaction);
  } catch (error) {
    Stumper.caughtError(error, "common:onInteractionCreate:onModalSubmit");
    if (!interaction.replied) {
      await interaction.followUp({ content: "There was an error while executing this modal submit!", ephemeral: true });
    }
  }
}

async function onUserContextMenuCommand(client: Client, interaction: UserContextMenuCommandInteraction): Promise<void> {
  if (!interaction.isUserContextMenuCommand || interaction.commandType !== ApplicationCommandType.User) return;

  const userContextMenu: UserContextMenuCommand | undefined = client.contextMenus.get(interaction.commandName);
  if (!userContextMenu) return;
  try {
    Stumper.info(`Running user context menu command for ${userContextMenu.name}`, "common:onInteractionCreate:onUserContextMenuCommand");
    await userContextMenu.execute(interaction);
  } catch (error) {
    Stumper.caughtError(error, "common:onInteractionCreate:onUserContextMenuCommand");
    if (!interaction.replied) {
      await interaction.followUp({ content: "There was an error while executing this user context menu command!", ephemeral: true });
    }
  }
}

async function onMessageContextMenuCommand(client: Client, interaction: MessageContextMenuCommandInteraction): Promise<void> {
  if (!interaction.isMessageContextMenuCommand || interaction.commandType !== ApplicationCommandType.Message) return;

  const messageContextMenu: MessageContextMenuCommand | undefined = client.contextMenus.get(interaction.commandName);
  if (!messageContextMenu) return;
  try {
    Stumper.info(`Running message context menu command for ${messageContextMenu.name}`, "common:onInteractionCreate:onMessageContextMenuCommand");
    await messageContextMenu.execute(interaction);
  } catch (error) {
    Stumper.caughtError(error, "common:onInteractionCreate:onMessageContextMenuCommand");
    if (!interaction.replied) {
      await interaction.followUp({ content: "There was an error while executing this message context menu command!", ephemeral: true });
    }
  }
}
