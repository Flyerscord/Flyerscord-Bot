import { AdminSlashCommand } from "@common/models/SlashCommand";
import { ChatInputCommandInteraction } from "discord.js";
import JoinLeaveDB from "../../db/JoinLeaveDB";
import discord from "@common/utils/discord/discord";
import ConfigManager from "@common/managers/ConfigManager";
import { AuditLogSeverity } from "@common/db/schema";

export default class SetRaidProtectionCommand extends AdminSlashCommand {
  constructor() {
    super("setraidprotection", "Enables or disables the raid protection. This will prevent new users from completing the captcha", {
      ephemeral: true,
    });

    this.data
      .addSubcommand((subcommand) =>
        subcommand
          .setName("enable")
          .setDescription("Enable the raid protection")
          .addStringOption((option) => option.setName("confirm").setDescription("Enter CONFIRM to confirm").setRequired(true)),
      )
      .addSubcommand((subcommand) => subcommand.setName("disable").setDescription("Disable the raid protection"));
  }

  async execute(interaction: ChatInputCommandInteraction): Promise<void> {
    const db = new JoinLeaveDB();

    const currentState = await db.getRaidProtectionActive();

    if (this.isSubCommand(interaction, "enable")) {
      if (currentState) {
        await this.replies.reply({ content: "Raid protection is already enabled!" });
        return;
      }
      const confirmation: string = this.getStringParamValue(interaction, "confirm");
      if (confirmation != "CONFIRM") {
        await this.replies.reply({ content: "Incorrect confirmation! Please try again." });
        return;
      }

      await db.setRaidProtectionActive(true);
      await this.replies.reply({ content: "Raid protection enabled!" });

      await discord.messages.sendMessageToChannel(
        ConfigManager.getInstance().getConfig("Common").adminLoungeChannelId,
        "Raid protection has been Enabled! Captcha answers will be disabled until the raid is resolved.",
      );

      void db.createAuditLog({
        action: "raidProtectionEnabled",
        userId: interaction.user.id,
        severity: AuditLogSeverity.CRITICAL,
      });

      // Send messages to the threads that will blocked from completing the captcha
      const notVerifiedUsers = await db.getNotVerifiedUsersBeforeDate(new Date());
      const message = "Your captcha has been disabled due to a raid. Please wait until it is resolved to complete the captcha.";
      await Promise.all(
        notVerifiedUsers.map(async (user) => {
          if (!user.threadId) return;
          await discord.messages.sendMessageToThread(user.threadId, message);
        }),
      );
    } else if (this.isSubCommand(interaction, "disable")) {
      if (!currentState) {
        await this.replies.reply({ content: "Raid protection is already disabled!" });
        return;
      }

      await db.setRaidProtectionActive(false);
      await this.replies.reply({ content: "Raid protection disabled!" });

      await discord.messages.sendMessageToChannel(
        ConfigManager.getInstance().getConfig("Common").adminLoungeChannelId,
        "Raid protection has been disabled! Captcha answers are being accepted again.",
      );

      void db.createAuditLog({
        action: "raidProtectionDisabled",
        userId: interaction.user.id,
        severity: AuditLogSeverity.CRITICAL,
      });

      // Send messages to the threads that were blocked from completing the captcha
      const notVerifiedUsers = await db.getNotVerifiedUsersBeforeDate(new Date());
      const message = "Your captcha has been enabled again. Please complete the captcha to continue.";
      await Promise.all(
        notVerifiedUsers.map(async (user) => {
          if (!user.threadId) return;
          await discord.messages.sendMessageToThread(user.threadId, message);
        }),
      );
    }
  }
}
