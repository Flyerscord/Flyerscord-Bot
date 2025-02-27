import Stumper from "stumper";

import { sleepMs } from "../sleep";
import { getGuild } from "./guilds";
import { Collection, GuildEmoji } from "discord.js";
import ClientManager from "../../managers/ClientManager";

export const NHL_EMOJI_GUILD_ID = "670839648683163656";

export async function addEmoji(emoji: IEmoji): Promise<GuildEmoji | undefined> {
  const guild = getGuild();
  if (guild) {
    try {
      const createEmoji = await guild.emojis.create({ attachment: emoji.url, name: emoji.name });
      Stumper.info(`Successfully created emoji: ${createEmoji.name}`, "common:emojis:addEmoji");
      return createEmoji;
    } catch (error) {
      Stumper.error(`Failed to create ${emoji.name} emoji using the url: ${emoji.url}`, "common:emojis:addEmoji");
      Stumper.caughtError(error, "common:emojis:addEmoji");
    }
  }
  return undefined;
}

export async function addMultipleEmojis(emojis: IEmoji[]): Promise<(GuildEmoji | undefined)[]> {
  const guild = getGuild();
  const emojisCreated: (GuildEmoji | undefined)[] = [];
  if (guild) {
    for (let i = 0; i < emojis.length; i++) {
      const emoji = emojis[i];
      emojisCreated.push(await addEmoji(emoji));
      await sleepMs(500);
    }
  }
  return emojisCreated;
}

export async function deleteEmoji(emojiName: string, reason: string): Promise<boolean> {
  const guild = getGuild();
  if (guild) {
    try {
      await guild.emojis.delete(emojiName, reason);
      Stumper.info(`Successfully deleted emoji ${emojiName}. Reason: ${reason}`, "common:emojis:deleteEmoji");
    } catch (error) {
      Stumper.error(`Failed to delete ${emojiName}.`, "common:emojis:deleteEmoji");
      Stumper.caughtError(error, "common:emojis:deleteEmoji");
    }
  }
  return false;
}

export async function deleteMultipleEmojis(emojiNames: string[], reasons: string[]): Promise<boolean> {
  let returnVal = true;
  const guild = getGuild();
  if (guild) {
    for (let i = 0; i < emojiNames.length; i++) {
      const emojiName = emojiNames[i];
      const reason = reasons[i];
      const result = await deleteEmoji(emojiName, reason);
      returnVal = returnVal && result;
      await sleepMs(500);
    }
  }
  return returnVal;
}

export async function getGuildEmojiByName(name: string): Promise<GuildEmoji | undefined> {
  const guild = getGuild();
  if (guild) {
    let emojis: Collection<string, GuildEmoji> | undefined;
    try {
      emojis = await guild.emojis.fetch();
    } catch (error) {
      Stumper.caughtError(error, "common:emojis:getGuildEmojiByName");
      return undefined;
    }
    return emojis.find((emoji) => emoji.name == name);
  }
  return undefined;
}

export async function getClientEmojiByName(name: string): Promise<GuildEmoji | undefined> {
  const client = ClientManager.getInstance().client;
  const emoji = client.emojis.cache.find((emoji) => emoji.name == name);
  if (emoji) {
    return emoji;
  } else {
    Stumper.debug(`Emoji ${name} not found in cache`, "common:emojis:getClientEmojiByName");
    return undefined;
  }
}

export async function getClientEmojiByNameAndGuildID(name: string, guildId: string): Promise<GuildEmoji | undefined> {
  const client = ClientManager.getInstance().client;
  const emoji = client.emojis.cache.find((emoji) => emoji.name == name && emoji.guild.id == guildId);
  if (emoji) {
    return emoji;
  } else {
    Stumper.debug(`Emoji ${name} not found in cache`, "common:emojis:getClientEmojiByIdAndGuildID");
    return undefined;
  }
}

interface IEmoji {
  url: string;
  name: string;
}
