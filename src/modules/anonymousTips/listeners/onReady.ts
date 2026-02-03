import ClientManager from "@common/managers/ClientManager";
import ConfigManager from "@common/managers/ConfigManager";
import discord from "@common/utils/discord/discord";
import { ActionRowBuilder, ButtonBuilder, ButtonStyle, MessageActionRowComponentBuilder } from "discord.js";
import { bold, Colors, EmbedBuilder } from "discord.js";
import AnonymousTipsDB from "../db/AnonymousTipsDB";
import Stumper from "stumper";

export default (): void => {
  const client = ClientManager.getInstance().client;
  client.on("clientReady", async () => {
    await sendTipsStarterMessage();
  });
};

async function sendTipsStarterMessage(): Promise<void> {
  const starterChannelId = ConfigManager.getInstance().getConfig("AnonymousTips").starterChannelId;

  const db = new AnonymousTipsDB();

  let createMessage = false;
  const starterMessageId = await db.getStarterMessageId();
  if (!starterMessageId) {
    createMessage = true;
  } else {
    const message = await discord.messages.getMessage(starterChannelId, starterMessageId);
    if (!message) {
      createMessage = true;
    }
  }

  if (createMessage) {
    const embed = getEmbed();

    const sendTipButton = new ButtonBuilder().setCustomId("sendTip").setLabel("Send Tip").setStyle(ButtonStyle.Primary);

    const row = new ActionRowBuilder<MessageActionRowComponentBuilder>().addComponents(sendTipButton);
    const message = await discord.messages.sendEmbedAndButtonsToChannel(starterChannelId, embed, row);
    if (message) {
      await db.setStarterMessageId(message.id);

      // TODO: Figure out how to recreate the message collector for the starter message on bot startup. The leaderboard one only lasts a minute.
    } else {
      Stumper.error("Failed to send starter message", "anonymousTips:onReady");
    }
  } else {
    Stumper.info("Starter message already exists", "anonymousTips:onReady");
  }
}

function getEmbed(): EmbedBuilder {
  const embed = new EmbedBuilder();

  embed.setTitle("Anonymous Tips");
  embed.setDescription(
    `Send an ${bold("anonymous")} message to the server admins.\n\n` +
      `Your identity is ${bold("encrypted")} for privacy and only stored to combat abuse. ` +
      "Decryption requires manual database access.",
  );
  embed.setColor(Colors.Grey);

  return embed;
}
