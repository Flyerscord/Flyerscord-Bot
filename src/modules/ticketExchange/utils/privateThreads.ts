import ConfigManager from "@common/managers/ConfigManager";
import { ButtonStyle, GuildMember, roleMention } from "discord.js";
import TicketExchangeDB from "../db/TicketExchangeDB";
import discord from "@common/utils/discord/discord";
import { PrivateThreadType } from "../db/schema";
import Stumper from "stumper";

export async function createNewSTHThread(member: GuildMember): Promise<boolean> {
  const db = new TicketExchangeDB();
  const config = ConfigManager.getInstance().getConfig("TicketExchange");

  const thread = await discord.threads.createPrivateThread(config.privateThreadChannelId, `STH Verification for ${member.user.username}`, {
    reason: "STH Verification Thread",
    startMessage: config.sthVerificationStartMessage,
  });

  if (!thread) {
    Stumper.error(`Failed to create STH private thread for ${member.user.username}`, "ticketExchange:privateThreads:createNewSTHThread");
    return false;
  }

  await db.addPrivateThread(member.id, PrivateThreadType.STH, thread.id);

  // Create approve/deny buttons
  const approveButton = discord.buttons.createButton("TicketExchange", "approveSTH", "Approve", ButtonStyle.Success);
  const denyButton = discord.buttons.createButton("TicketExchange", "denySTH", "Deny", ButtonStyle.Danger);

  const buttonRow = discord.buttons.createRow([approveButton, denyButton]);

  await discord.messages.sendCustomToThread(thread.id, { content: roleMention(config.verifierRoleId), components: [buttonRow] });
  return true;
}
