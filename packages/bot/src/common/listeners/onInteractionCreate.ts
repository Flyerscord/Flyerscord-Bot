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
import MyAuditLog from "../utils/MyAuditLog";

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
    void MyAuditLog.createAuditLog("Common", {
      action: "SlashCommandRan",
      userId: interaction.user.id,
      details: {
        command: command.name,
        channelId: interaction.channelId,
        args: interaction.options.data,
      },
    });
    await command.run(interaction);
  } catch (error) {
    Stumper.caughtError(error, "common:onInteractionCreate:onSlashCommand");
    await command.replies.reply({ content: "There was an error while executing this command!", ephemeral: true });
  }
}

async function onModalSubmit(client: Client, interaction: ModalSubmitInteraction): Promise<void> {
  if (!interaction.isModalSubmit() || !(interaction instanceof ModalSubmitInteraction)) return;

  const idWithoutData = interaction.customId.split("-")[0];

  const modal: ModalMenu | undefined = client.modals.find((modal: ModalMenu) => modal.name.startsWith(idWithoutData));
  if (!modal) return;
  try {
    void MyAuditLog.createAuditLog("Common", {
      action: "ModalSubmitted",
      userId: interaction.user.id,
      details: {
        id: idWithoutData,
        name: modal.name,
        channelId: interaction.channelId,
      },
    });
    await modal.run(interaction);
  } catch (error) {
    Stumper.caughtError(error, "common:onInteractionCreate:onModalSubmit");
    await modal.replies.reply({ content: "There was an error while executing this modal submit!", ephemeral: true });
  }
}

async function onUserContextMenuCommand(client: Client, interaction: UserContextMenuCommandInteraction): Promise<void> {
  if (!interaction.isUserContextMenuCommand || interaction.commandType !== ApplicationCommandType.User) return;

  const userContextMenu: UserContextMenuCommand | undefined = client.contextMenus.get(interaction.commandName);
  if (!userContextMenu) return;
  try {
    void MyAuditLog.createAuditLog("Common", {
      action: "UserContextMenuCommandRan",
      userId: interaction.user.id,
      details: {
        command: interaction.commandName,
        channelId: interaction.channelId,
        targetUser: interaction.targetUser.id,
      },
    });
    await userContextMenu.run(interaction);
  } catch (error) {
    Stumper.caughtError(error, "common:onInteractionCreate:onUserContextMenuCommand");
    await userContextMenu.replies.reply({ content: "There was an error while executing this user context menu command!", ephemeral: true });
  }
}

async function onMessageContextMenuCommand(client: Client, interaction: MessageContextMenuCommandInteraction): Promise<void> {
  if (!interaction.isMessageContextMenuCommand || interaction.commandType !== ApplicationCommandType.Message) return;

  const messageContextMenu: MessageContextMenuCommand | undefined = client.contextMenus.get(interaction.commandName);
  if (!messageContextMenu) return;
  try {
    void MyAuditLog.createAuditLog("Common", {
      action: "MessageContextMenuCommandRan",
      userId: interaction.user.id,
      details: {
        command: interaction.commandName,
        channelId: interaction.channelId,
        targetMessage: interaction.targetMessage.id,
      },
    });
    await messageContextMenu.run(interaction);
  } catch (error) {
    Stumper.caughtError(error, "common:onInteractionCreate:onMessageContextMenuCommand");
    await messageContextMenu.replies.reply({ content: "There was an error while executing this message context menu command!", ephemeral: true });
  }
}
