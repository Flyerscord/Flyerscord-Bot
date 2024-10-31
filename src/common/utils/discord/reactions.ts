import { Message } from "discord.js";

export function reactToMessageWithEmoji(message: Message, emoji: string): void {
  message.react(emoji);
}
