import { Message } from "discord.js";
import TextCommand from "../../models/TextCommand";

export default class Example extends TextCommand {
  constructor() {
    super("Example", "example");
  }

  async execute(message: Message, args: Array<string>): Promise<void> {
    if (args.length == 0) {
      message.reply("No string provided");
      return;
    }

    const argsStr = args.join(" ");
    message.reply(argsStr);
  }
}
