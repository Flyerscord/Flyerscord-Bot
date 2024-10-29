import { Message } from "discord.js";
import TextCommand from "../../../../common/models/TextCommand.js";
import { getRandomNumber } from "../../../../common/utils/misc.js";
import discord from "../../../../common/utils/discord/discord.js";

export default class Fuck2TextCommand extends TextCommand {
  constructor() {
    super("fuck2", "fuck2");
  }

  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  async execute(message: Message, args: Array<string>): Promise<void> {
    const teams = ["Pens", "Pens", "Rags", "Rags", "Isles", "Bruins", "caps", "Devils"];
    const index = getRandomNumber(0, teams.length - 1);
    const team = teams[index];

    let outStr: string;
    if (team == "caps") {
      outStr = "fuck the caps!";
    } else {
      outStr = `Fuck the ${team}!`;
    }

    discord.messages.sendMessageToChannel(message.channel.id, outStr);
  }
}
