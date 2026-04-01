import { bold, ChatInputCommandInteraction, userMention } from "discord.js";
import { AdminSlashCommand } from "@common/models/SlashCommand";
import discord from "@common/utils/discord/discord";
import ConfigManager from "@common/managers/ConfigManager";
import JoinImageGenerator from "@modules/joinLeave/utils/JoinImageGenerator";
import Stumper from "stumper";

export default class AdminLeaveCommand extends AdminSlashCommand {
  constructor() {
    super("adminleave", "Send the leave message for all the admins", { ephemeral: true });

    this.data.addStringOption((option) => option.setName("confirm").setDescription("Set to 'CONFIRM' to confirm the action").setRequired(true));
  }

  async execute(interaction: ChatInputCommandInteraction): Promise<void> {
    const confirm = this.getStringParamValue(interaction, "confirm");

    if (confirm !== "CONFIRM") {
      await this.replies.reply("You did not confirm the action");
      return;
    }

    const admins = [
      "296375454779047938",
      "873291318682611742",
      "748975465854664886",
      "1182383077603938354",
      "610319327706611716",
      "824757509653790782",
      "140656762960347136",
      "201116627012550656",
      "164145987151986688",
      "189519505888641025",
      "187551229998661632",
    ];

    let failed = [];
    for (const admin of admins) {
      const member = await discord.members.getMember(admin, true);
      if (!member) {
        failed.push(admin);
        continue;
      }
      const username = member.displayName || member.user.username;
      const message = `${userMention(member.id)}\nWelcome back to ${bold("Go Flyers")}!! Rule #1: Fuck the Pens!`;
      const joinImageGenerator = new JoinImageGenerator(username, member.displayAvatarURL(), discord.members.getNumberOfMembers());
      let joinPhoto: Buffer;
      try {
        joinPhoto = await joinImageGenerator.getImage();
        await discord.messages.sendMessageAndImageBufferToChannel(ConfigManager.getInstance().getConfig("JoinLeave").channelId, message, joinPhoto);
      } catch (error) {
        Stumper.caughtError(error, "admin:AdminLeaveCommand");
      }
    }

    if (failed.length > 0) {
      await this.replies.reply(`Failed to send the join message for the following admins: ${failed.join(", ")}`);
    } else {
      await this.replies.reply("Successfully sent the join message for all the admins");
    }
  }
}
