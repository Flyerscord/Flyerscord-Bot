import { Message } from "discord.js";

import Stumper from "stumper";
import ClientManager from "@common/managers/ClientManager";
import discord from "@common/utils/discord/discord";
import ConfigManager from "@common/config/ConfigManager";

export default (): void => {
  ClientManager.getInstance().client.on("messageCreate", async (message: Message) => {
    if (await checkForQuoteCreation(message)) return;
  });
};

async function checkForQuoteCreation(message: Message): Promise<boolean> {
  const ub3rBotUserId = ConfigManager.getInstance().getConfig("Admin").ub3rBot.userId;
  if (!message.author.bot || message.author.id !== ub3rBotUserId) return false;

  const regex = /^New quote added by (.+) as #([0-9]+) \((https:\/\/discordapp.com\/channels\/.+)\)$/;
  const match = regex.exec(message.content);

  if (!match) return false;

  Stumper.info(`Quote creation detected!`, "Admin:onMessageCreate:checkForQuoteCreation");

  const [, creatorUserId, quoteNumber, quotedMessageLink] = match;

  const creator = await discord.members.getMember(creatorUserId);

  let creatorUsername: string;
  if (!creator) {
    Stumper.error(`Could not find user with id ${creatorUserId}`, "Admin:onMessageCreate:checkForQuoteCreation");
    creatorUsername = "Unknown";
  } else {
    creatorUsername = creator.displayName || creator.user.username;
  }

  const alertMessage = `New quote #${quoteNumber} added by ${creatorUsername} (${creatorUserId})\nQuoted message: ${quotedMessageLink}\nQuote created message: ${message.url}`;

  const alertChannelId = ConfigManager.getInstance().getConfig("Admin").ub3rBot.alertChannelId;
  await discord.messages.sendMessageToChannel(alertChannelId, alertMessage);
  return true;
}
