import { ChatInputCommandInteraction } from "discord.js";
import { AdminSlashCommand } from "@common/models/SlashCommand";

import discord from "@common/utils/discord/discord";
import { sleepSec } from "@common/utils/sleep";
import Stumper from "stumper";
import MyImageKit from "../../utils/ImageKit";
import ConfigManager from "@common/managers/ConfigManager";
import CustomCommandsDB from "../../db/CustomCommandsDB";

export default class TestAllCommand extends AdminSlashCommand {
  constructor() {
    super("customtest", "Runs all of the custom commands to test the links");
  }

  async execute(interaction: ChatInputCommandInteraction): Promise<void> {
    const db = new CustomCommandsDB();
    let commands = await db.getAllCommands();

    commands = commands.sort((a, b) => a.name.localeCompare(b.name));

    const channel = interaction.channel;

    if (channel) {
      for (let i = 0; i < commands.length; i++) {
        const command = commands[i];
        let text = command.text;

        const prefix = ConfigManager.getInstance().getConfig("CustomCommands").prefix;

        const imageKit = MyImageKit.getInstance();

        if (imageKit.isImageKitUrl(text)) {
          const url = await imageKit.convertToProxyUrlIfNeeded(text);

          if (url) {
            text = url;
            Stumper.debug(`Converted image kit url to proxy url: ${text}`, "customCommands:onMessageCreate:checkForCustomTextCommand");
          }
        }

        await discord.messages.sendMessageToChannel(channel.id, `\`${prefix}${command.name}\``);
        await discord.messages.sendMessageToChannel(channel.id, text);

        await sleepSec(1);
      }
      await this.replies.reply("Command test complete");
    } else {
      await this.replies.reply("Error testing commands");
    }
  }
}
