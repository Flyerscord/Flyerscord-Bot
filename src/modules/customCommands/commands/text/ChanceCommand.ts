import { Message } from "discord.js";
import TextCommand from "../../../../common/models/TextCommand";
import { getRandomNumber } from "../../../../common/utils/misc";
import discord from "../../../../common/utils/discord/discord";
import { COMMAND_LOCATION } from "../../../../common/interfaces/ITextCommandOptions";
import ConfigManager from "@common/config/ConfigManager";

export default class ChanceTextCommand extends TextCommand {
  constructor() {
    super(ConfigManager.getInstance().getConfig("CustomCommands").prefix, "chance", "chance", { allowedLocations: [COMMAND_LOCATION.GUILD] });
  }

  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  async execute(message: Message, args: string[]): Promise<void> {
    const options = [
      "https://images.flyerscord.com/chance-answeryes.png",
      "https://images.flyerscord.com/chance-noidea.png",
      "https://images.flyerscord.com/chance-asklater.png",
      "https://images.flyerscord.com/chance-no.png",
      "https://images.flyerscord.com/chance-yes.png",
    ];
    const index = getRandomNumber(0, options.length - 1);
    const option = options[index];

    discord.messages.sendMessageToChannel(message.channel.id, option);
  }
}
