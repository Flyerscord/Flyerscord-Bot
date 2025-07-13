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
import SlashCommand from "@common/models/SlashCommand";

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

  const command: SlashCommand | undefined = client.slashCommands.get(interaction.commandName);
  if (!command) return;
  try {
    await command.run(interaction);
  } catch (error) {
    Stumper.caughtError(error, "common:onInteractionCreate:onSlashCommand");
    command.replies.reply({ content: "There was an error while executing this command!", ephemeral: true });
  }
}

async function onModalSubmit(client: Client, interaction: ModalSubmitInteraction): Promise<void> {
  if (!interaction.isModalSubmit() || !(interaction instanceof ModalSubmitInteraction)) return;

  const idWithoutData = interaction.customId.split("-")[0];

  const modal: ModalMenu | undefined = client.modals.find((modal: ModalMenu) => modal.name.startsWith(idWithoutData));
  if (!modal) return;
  try {
    await modal.run(interaction);
  } catch (error) {
    Stumper.caughtError(error, "common:onInteractionCreate:onModalSubmit");
    modal.replies.reply({ content: "There was an error while executing this modal submit!", ephemeral: true });
  }
}

async function onUserContextMenuCommand(client: Client, interaction: UserContextMenuCommandInteraction): Promise<void> {
  if (!interaction.isUserContextMenuCommand || interaction.commandType !== ApplicationCommandType.User) return;

  const userContextMenu: UserContextMenuCommand | undefined = client.contextMenus.get(interaction.commandName);
  if (!userContextMenu) return;
  try {
    await userContextMenu.run(interaction);
  } catch (error) {
    Stumper.caughtError(error, "common:onInteractionCreate:onUserContextMenuCommand");
    userContextMenu.replies.reply({ content: "There was an error while executing this user context menu command!", ephemeral: true });
  }
}

async function onMessageContextMenuCommand(client: Client, interaction: MessageContextMenuCommandInteraction): Promise<void> {
  if (!interaction.isMessageContextMenuCommand || interaction.commandType !== ApplicationCommandType.Message) return;

  const messageContextMenu: MessageContextMenuCommand | undefined = client.contextMenus.get(interaction.commandName);
  if (!messageContextMenu) return;
  try {
    await messageContextMenu.run(interaction);
  } catch (error) {
    Stumper.caughtError(error, "common:onInteractionCreate:onMessageContextMenuCommand");
    messageContextMenu.replies.reply({ content: "There was an error while executing this message context menu command!", ephemeral: true });
  }
}
