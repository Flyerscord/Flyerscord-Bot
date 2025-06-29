import { Message } from "discord.js";
import TextCommand from "@common/models/TextCommand";
import { getRandomNumber } from "@common/utils/misc";
import discord from "@common/utils/discord/discord";
import { COMMAND_LOCATION } from "@common/interfaces/ITextCommandOptions";
import ConfigManager from "@common/config/ConfigManager";

export default class Fuck2TextCommand extends TextCommand {
  constructor() {
    super(ConfigManager.getInstance().getConfig("CustomCommands").prefix, "fuck2", "fuck2", { allowedLocations: [COMMAND_LOCATION.GUILD] });
  }

  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  async execute(message: Message, args: string[]): Promise<void> {
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
