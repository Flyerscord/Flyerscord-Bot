import { Colors, EmbedBuilder, GuildMember, Message, User, userMention } from "discord.js";

import Stumper from "stumper";
import ClientManager from "@common/managers/ClientManager";
import discord from "@common/utils/discord/discord";
import ConfigManager from "@common/managers/ConfigManager";

export default (): void => {
  ClientManager.getInstance().client.on("messageCreate", async (message: Message) => {
    if (await checkForQuoteCreation(message)) return;
  });
};

async function checkForQuoteCreation(message: Message): Promise<boolean> {
  const ub3rBotUserId = ConfigManager.getInstance().getConfig("Admin")["ub3rBot.userId"];
  if (!message.author.bot || message.author.id !== ub3rBotUserId) return false;

  const regex = /^New quote added by (.+) as #([0-9]+) \(<(https:\/\/discordapp\.com\/channels\/\d+\/(\d+)\/(\d+))>\)$/;
  const match = regex.exec(message.content);

  if (!match) return false;

  Stumper.info(`Quote creation detected!`, "Admin:onMessageCreate:checkForQuoteCreation");

  const [, quotedByUsername, quoteNumber, quotedMessageLink, channelId, messageId] = match;

  const quotedMessage = await discord.messages.getMessage(channelId, messageId);
  if (!quotedMessage) {
    Stumper.error(`Quoted message not found!`, "Admin:onMessageCreate:checkForQuoteCreation");
    return false;
  }

  const quotedByUser = await discord.members.getMemberByUsername(quotedByUsername);

  if (!quotedByUser) {
    Stumper.error(`Quoted by user not found!`, "Admin:onMessageCreate:checkForQuoteCreation");
    return false;
  }

  const embed = getQuoteCreationEmbed(quotedByUser, quotedMessage.author, quoteNumber, quotedMessageLink, message.url);

  const alertChannelId = ConfigManager.getInstance().getConfig("Admin")["ub3rBot.alertChannelId"];
  await discord.messages.sendEmbedToChannel(alertChannelId, embed);
  return true;
}

function getQuoteCreationEmbed(
  quotedBy: GuildMember,
  ogMessageAuthor: User,
  quoteNumber: string,
  quotedMessageLink: string,
  quoteCreatedMessageLink: string,
): EmbedBuilder {
  const embed = new EmbedBuilder();

  embed.setTitle(`New Quote #${quoteNumber} Created!`);
  embed.setDescription(`Quoted by ${userMention(quotedBy.user.id)}\nOG message author: ${userMention(ogMessageAuthor.id)}`);
  embed.addFields(
    {
      name: "Quoted Message",
      value: quotedMessageLink,
      inline: true,
    },
    {
      name: "Quote Created Message",
      value: quoteCreatedMessageLink,
      inline: true,
    },
  );
  embed.setColor(Colors.Yellow);
  embed.setTimestamp(new Date());

  return embed;
}
