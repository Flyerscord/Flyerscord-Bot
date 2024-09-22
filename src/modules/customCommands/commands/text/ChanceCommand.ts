import { Message } from "discord.js";
import TextCommand from "../../../../common/models/TextCommand";
import { getRandomNumber } from "../../../../common/utils/misc";
import discord from "../../../../common/utils/discord/discord";

export default class ChanceTextCommand extends TextCommand {
  constructor() {
    super("chance", "chance");
  }

  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  async execute(message: Message, args: Array<string>): Promise<void> {
    const options = [
      "https://i.imgur.com/sW3zl2i.png",
      "https://i.imgur.com/mMLYXHu.png",
      "https://i.imgur.com/RQw2PYT.png",
      "https://i.imgur.com/oFknryL.png",
      "https://i.imgur.com/FDYz3zy.png",
    ];
    const index = getRandomNumber(0, options.length - 1);
    const option = options[index];

    discord.messages.sendMessageToChannel(message.channel.id, option);
  }
}
