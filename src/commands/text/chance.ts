import { Message } from "discord.js";
import TextCommand from "../../models/TextCommand";
import { randomNumber } from "../../util/utils";

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
    const index = randomNumber(0, options.length - 1);
    const option = options[index];

    message.channel.send(option);
  }
}
