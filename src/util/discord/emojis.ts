import { Guild } from "discord.js";
import Stumper from "stumper";
import { sleepMs } from "../utils";

export async function addEmoji(guild: Guild, emoji: IEmoji): Promise<void> {
  if (guild) {
    try {
      await guild.emojis.create({ attachment: emoji.url, name: emoji.name });
    } catch (error) {
      Stumper.error(`Failed to create ${emoji.name} emoji using the url: ${emoji.url}`, "addEmoji");
    }
  }
}

export async function addMultipleEmojis(guild: Guild, emojis: Array<IEmoji>): Promise<void> {
  if (guild) {
    for (let i = 0; i < emojis.length; i++) {
      const emoji = emojis[i];
      await addEmoji(guild, emoji);
      await sleepMs(500);
    }
  }
}

export async function deleteEmoji(guild: Guild, emojiName: string, reason: string): Promise<boolean> {
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

export async function deleteMultipleEmojis(guild: Guild, emojiNames: Array<string>, reasons: Array<string>): Promise<boolean> {
  let returnVal = true;
  if (guild) {
    for (let i = 0; i < emojiNames.length; i++) {
      const emojiName = emojiNames[i];
      const reason = reasons[i];
      const result = await deleteEmoji(guild, emojiName, reason);
      returnVal = returnVal && result;
      await sleepMs(500);
    }
  }
  return returnVal;
}

interface IEmoji {
  url: string;
  name: string;
}
