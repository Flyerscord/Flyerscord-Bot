import Stumper from "stumper";

import { sleepMs } from "../sleep";
import { getGuild } from "./guilds";
import { GuildEmoji } from "discord.js";

export async function addEmoji(emoji: IEmoji): Promise<GuildEmoji | undefined> {
  const guild = getGuild();
  if (guild) {
    try {
      return await guild.emojis.create({ attachment: emoji.url, name: emoji.name });
    } catch (error) {
      Stumper.error(`Failed to create ${emoji.name} emoji using the url: ${emoji.url}`, "addEmoji");
      Stumper.error(error), "addEmoji";
    }
  }
  return undefined;
}

export async function addMultipleEmojis(emojis: Array<IEmoji>): Promise<Array<GuildEmoji | undefined>> {
  const guild = getGuild();
  const emojisCreated: Array<GuildEmoji | undefined> = [];
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
      Stumper.info(`Successfully deleted emoji ${emojiName}. Reason: ${reason}`, "deleteEmoji");
    } catch (error) {
      Stumper.error(`Failed to delete ${emojiName}. Error: ${error}`, "deleteEmoji");
    }
  }
  return false;
}

export async function deleteMultipleEmojis(emojiNames: Array<string>, reasons: Array<string>): Promise<boolean> {
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

export function getEmojiByName(name: string): GuildEmoji | undefined {
  const guild = getGuild();
  if (guild) {
    return guild.emojis.cache.find((emoji) => emoji.name == name);
  }
  return undefined;
}

interface IEmoji {
  url: string;
  name: string;
}
