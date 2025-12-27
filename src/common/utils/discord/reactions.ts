import { Message } from "discord.js";

export async function reactToMessageWithEmoji(message: Message, emoji: string): Promise<void> {
  await message.react(emoji);
}
