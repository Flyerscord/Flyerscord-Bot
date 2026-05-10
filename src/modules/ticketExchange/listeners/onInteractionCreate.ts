import ClientManager from "@common/managers/ClientManager";
import discord from "@common/utils/discord/discord";
import ConfigManager from "@common/managers/ConfigManager";
import Stumper from "stumper";
import { GuildMember } from "discord.js";
import { PrivateThreadType } from "../db/schema";
import TicketExchangeDB from "../db/TicketExchangeDB";
import { AuditLogSeverity } from "@common/db/schema";
import MyAuditLog from "@common/utils/MyAuditLog";
import { createNewSTHThread } from "../utils/privateThreads";

export default (): void => {
  const client = ClientManager.getInstance().client;
  client.on("interactionCreate", async (interaction) => {
    if (!interaction.isButton()) return;

    const buttonId = interaction.customId;
    const config = ConfigManager.getInstance().getConfig("TicketExchange");
    const db = new TicketExchangeDB();

    if (!interaction.member || interaction.member instanceof GuildMember == false) {
      Stumper.error("Member not found", "ticketExchange:onInteractionCreate:onInteractionCreate");
      return;
    }

    switch (buttonId) {
      case "createNewPosting": {
        break;
      }
      case "sthVerification": {
        const alreadyVerified = discord.roles.userHasRole(interaction.member, config.verifiedSTHRoleId);
        if (alreadyVerified) {
          await interaction.reply({
            content: "You have already been verified!",
            ephemeral: true,
          });
          return;
        }

        const currentThreadId = await db.getPrivateThreadIdByUserId(interaction.member.id, PrivateThreadType.STH);
        if (currentThreadId !== "") {
          await interaction.reply({
            content: "You already have an open STH Verification thread!",
            ephemeral: true,
          });
          return;
        }

        const created = await createNewSTHThread(interaction.member);
        if (!created) {
          await interaction.reply({
            content: "There was an error creating the STH Verification thread!",
            ephemeral: true,
          });
          return;
        }

        await interaction.reply({
          content: "STH Verification thread created!",
          ephemeral: true,
        });

        break;
      }
      case "newPostNotification": {
        const hasNotificationRole = discord.roles.userHasRole(interaction.member, config.newPostNotificationRoleId);
        if (hasNotificationRole) {
          await discord.roles.removeRoleFromUser(interaction.member, config.newPostNotificationRoleId);
          await interaction.reply({
            content: "You have been removed from the new post notification role!",
            ephemeral: true,
          });
          return;
        }
        await discord.roles.addRoleToUser(interaction.member, config.newPostNotificationRoleId);
        await interaction.reply({
          content: "You have been added to the new post notification role!",
          ephemeral: true,
        });
        break;
      }
      case "approveSTH": {
        const threadId = interaction.channelId;

        const privateThreadInfo = await db.getPrivateThreadIdByThreadId(threadId);
        if (!privateThreadInfo) {
          Stumper.error(
            `Could not find private thread with ID ${threadId}. This should not happen!`,
            "ticketExchange:onInteractionCreate:approveSTH",
          );
          await interaction.reply({
            content: "This is not a STH Verification thread!",
            ephemeral: true,
          });
          return;
        }

        const verifyingMember = await discord.members.getMember(privateThreadInfo.userId);
        if (!verifyingMember) {
          Stumper.error(
            `Could not find member with ID ${privateThreadInfo.userId}. This should not happen!`,
            "ticketExchange:onInteractionCreate:approveSTH",
          );
          await interaction.reply({
            content: "There was an error verifying the STH!",
            ephemeral: true,
          });
          return;
        }

        // Add the verified role
        await discord.roles.addRoleToUser(verifyingMember, config.verifiedSTHRoleId);

        // Remove from the database
        await db.deletePrivateThread(threadId);

        await interaction.reply({
          content: `STH Verification for ${verifyingMember.user.username} has been approved!`,
        });

        void MyAuditLog.createAuditLog("TicketExchange", {
          action: "approvedSTH",
          userId: verifyingMember.id,
          severity: AuditLogSeverity.INFO,
          details: {
            approvedBy: interaction.user.id,
            threadId: threadId,
          },
        });

        // Lock and archive the thread
        await discord.threads.lockThread(threadId);
        await discord.threads.archiveThread(threadId);
        break;
      }
      case "denySTH": {
        const threadId = interaction.channelId;

        const privateThreadInfo = await db.getPrivateThreadIdByThreadId(threadId);
        if (!privateThreadInfo) {
          Stumper.error(
            `Could not find private thread with ID ${threadId}. This should not happen!`,
            "ticketExchange:onInteractionCreate:approveSTH",
          );
          await interaction.reply({
            content: "This is not a STH Verification thread!",
            ephemeral: true,
          });
          return;
        }

        const verifyingMember = await discord.members.getMember(privateThreadInfo.userId);
        if (!verifyingMember) {
          Stumper.error(
            `Could not find member with ID ${privateThreadInfo.userId}. This should not happen!`,
            "ticketExchange:onInteractionCreate:approveSTH",
          );
          await interaction.reply({
            content: "There was an error verifying the STH!",
            ephemeral: true,
          });
          return;
        }

        // Remove from the database
        await db.deletePrivateThread(threadId);

        await interaction.reply({
          content: `STH Verification for ${verifyingMember.user.username} has been approved!`,
        });

        void MyAuditLog.createAuditLog("TicketExchange", {
          action: "denySTH",
          userId: verifyingMember.id,
          severity: AuditLogSeverity.WARNING,
          details: {
            approvedBy: interaction.user.id,
            threadId: threadId,
          },
        });

        // Lock and archive the thread
        await discord.threads.lockThread(threadId);
        await discord.threads.archiveThread(threadId);
        break;
      }
    }
  });
};
