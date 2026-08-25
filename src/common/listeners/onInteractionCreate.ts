import {
  Interaction,
  Client,
  ModalSubmitInteraction,
  ChatInputCommandInteraction,
  UserContextMenuCommandInteraction,
  MessageContextMenuCommandInteraction,
  ButtonInteraction,
  CommandInteraction,
  ApplicationCommandType,
  MessageFlagsBitField,
} from "discord.js";

import Stumper from "stumper";
import ModalMenu from "../models/ModalMenu";
import ButtonHandler from "../models/ButtonHandler";
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
    await onButtonClick(client, interaction as ButtonInteraction);
    await onUserContextMenuCommand(client, interaction as UserContextMenuCommandInteraction);
    await onMessageContextMenuCommand(client, interaction as MessageContextMenuCommandInteraction);
  });
};

/**
 * Replies to `interaction` directly with an error message, bypassing the failed handler's shared
 * `InteractionReplies`, since by the time a handler's `run` has thrown, the interaction is no longer
 * bound in that handler's async context.
 * @param interaction - The interaction to reply to
 * @param content - The error message to send
 */
async function replyWithError(interaction: CommandInteraction | ModalSubmitInteraction | ButtonInteraction, content: string): Promise<void> {
  if (interaction.deferred) {
    await interaction.editReply({ content });
  } else if (!interaction.replied) {
    await interaction.reply({ content, flags: MessageFlagsBitField.Flags.Ephemeral });
  }
}

async function onSlashCommand(client: Client, interaction: ChatInputCommandInteraction): Promise<void> {
  if (!interaction.isCommand()) return;

  const command: SlashCommand | undefined = client.slashCommands.get(interaction.commandName);
  if (!command) return;
  try {
    void MyAuditLog.createAuditLog("Common", {
      action: "SlashCommandRan",
      userId: command.omitUserIdFromAuditLog ? undefined : interaction.user.id,
      details: {
        command: command.name,
        channelId: interaction.channelId,
        args: interaction.options.data,
      },
    });
    await command.run(interaction);
  } catch (error) {
    Stumper.caughtError(error, "common:onInteractionCreate:onSlashCommand");
    await replyWithError(interaction, "There was an error while executing this command!");
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
      userId: modal.omitUserIdFromAuditLog ? undefined : interaction.user.id,
      details: {
        id: idWithoutData,
        name: modal.name,
        channelId: interaction.channelId,
      },
    });
    await modal.run(interaction);
  } catch (error) {
    Stumper.caughtError(error, "common:onInteractionCreate:onModalSubmit");
    await replyWithError(interaction, "There was an error while executing this modal submit!");
  }
}

async function onButtonClick(client: Client, interaction: ButtonInteraction): Promise<void> {
  if (!interaction.isButton()) return;

  const idWithoutData = interaction.customId.split("-")[0];

  const button: ButtonHandler | undefined = client.buttons.find((button: ButtonHandler) => button.name.startsWith(idWithoutData));
  if (!button) return;
  try {
    void MyAuditLog.createAuditLog("Common", {
      action: "ButtonClicked",
      userId: button.omitUserIdFromAuditLog ? undefined : interaction.user.id,
      details: {
        id: idWithoutData,
        name: button.name,
        channelId: interaction.channelId,
      },
    });
    await button.run(interaction);
  } catch (error) {
    Stumper.caughtError(error, "common:onInteractionCreate:onButtonClick");
    await replyWithError(interaction, "There was an error while handling this button click!");
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
    await replyWithError(interaction, "There was an error while executing this user context menu command!");
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
    await replyWithError(interaction, "There was an error while executing this message context menu command!");
  }
}
