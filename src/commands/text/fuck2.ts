import { Message } from "discord.js";
import TextCommand from "../../models/TextCommand";
import { randomNumber } from "../../util/utils";

export default class Fuck2TextCommand extends TextCommand {
  constructor() {
    super("fuck2", "fuck2");
  }

  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  async execute(message: Message, args: Array<string>): Promise<void> {
    const teams = ["Pens", "Pens", "Rags", "Rags", "Isles", "Bruins", "caps", "Devils"];
    const index = randomNumber(0, teams.length - 1);
    const team = teams[index];

    let outStr: string;
    if (team == "caps") {
      outStr = "fuck the caps!";
    } else {
      outStr = `Fuck the ${team}!`;
    }

    message.channel.send(outStr);
  }
}
