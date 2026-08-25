import { ChatInputCommandInteraction, EmbedBuilder, time, TimestampStyles } from "discord.js";
import { AdminSlashCommand } from "@common/models/SlashCommand";
import discord from "@common/utils/discord/discord";
import ConfigManager from "@common/managers/ConfigManager";
import Time from "@common/utils/Time";
import FantasyDB from "../../db/FantasyDB";
import { SeasonStatus, SkillLevel, VALID_TEAM_SIZES } from "../../db/schema";
import { getSignupEmbed } from "../../utils/Embeds";
import { getSignupButtonsRow } from "../../utils/signupButtonsRow";
import { applyApprovedRoles, closeSeason, computeTeamSizes } from "../../utils/closeSeason";
import SeasonCloseTask from "../../tasks/SeasonCloseTask";

export default class FantasySeasonCommand extends AdminSlashCommand {
  constructor() {
    super("fantasyseason", "Manage the Fantasy season", { ephemeral: true });

    this.data
      .addSubcommand((subcommand) =>
        subcommand
          .setName("start")
          .setDescription("Open Fantasy signups for a new season")
          .addStringOption((option) =>
            option.setName("signup-deadline").setDescription("When signups close. Format: MM/DD/YYYY HH:MM:SS (24 hour time)").setRequired(true),
          ),
      )
      .addSubcommand((subcommand) => subcommand.setName("close").setDescription("Close signups and propose team rosters now"))
      .addSubcommand((subcommand) => subcommand.setName("approve").setDescription("Approve the proposed rosters, assign roles, and close the season"))
      .addSubcommand((subcommand) => subcommand.setName("status").setDescription("Show current season signup counts"))
      .addSubcommand((subcommand) =>
        subcommand
          .setName("move")
          .setDescription("Move a user's signup to a different skill level")
          .addUserOption((option) => option.setName("user").setDescription("The user to move").setRequired(true))
          .addStringOption((option) =>
            option
              .setName("skill-level")
              .setDescription("The skill level to move them to")
              .setRequired(true)
              .addChoices(Object.values(SkillLevel).map((level) => ({ name: level, value: level }))),
          ),
      )
      .addSubcommand((subcommand) =>
        subcommand
          .setName("delete")
          .setDescription("Delete the current Fantasy season and all its signups")
          .addStringOption((option) => option.setName("confirm").setDescription("Enter CONFIRM to confirm").setRequired(true)),
      );
  }

  /**
   * Dispatches to the start/close/approve/status/move/delete season-management subcommands.
   */
  async execute(interaction: ChatInputCommandInteraction): Promise<void> {
    if (this.isSubCommand(interaction, "start")) {
      await this.executeStart(interaction);
    } else if (this.isSubCommand(interaction, "close")) {
      await this.executeClose();
    } else if (this.isSubCommand(interaction, "approve")) {
      await this.executeApprove();
    } else if (this.isSubCommand(interaction, "status")) {
      await this.executeStatus();
    } else if (this.isSubCommand(interaction, "move")) {
      await this.executeMove(interaction);
    } else if (this.isSubCommand(interaction, "delete")) {
      await this.executeDelete(interaction);
    } else {
      await this.replies.reply({ content: "Invalid subcommand!", ephemeral: true });
    }
  }

  /**
   * Opens signups for a new season: creates the season and posts the signup embed/buttons to the
   * configured signup channel, scheduling the automatic close for the given deadline.
   */
  private async executeStart(interaction: ChatInputCommandInteraction): Promise<void> {
    const db = new FantasyDB();

    const existingSeason = await db.getCurrentSeason();
    if (existingSeason) {
      await this.replies.reply({ content: "There is already an open or closing Fantasy season!", ephemeral: true });
      return;
    }

    const deadlineStr = this.getStringParamValue(interaction, "signup-deadline");
    const deadline = Time.getDateFromString(deadlineStr);
    if (!deadline) {
      await this.replies.reply({ content: "Error parsing signup deadline!", ephemeral: true });
      return;
    }
    if (deadline.getTime() <= Date.now()) {
      await this.replies.reply({ content: "Signup deadline must be in the future!", ephemeral: true });
      return;
    }

    const season = await db.createSeason(deadline);

    const config = ConfigManager.getInstance().getConfig("Fantasy");
    const signupCountsBySkillLevel = {} as Record<SkillLevel, number>;
    for (const skillLevel of Object.values(SkillLevel)) {
      signupCountsBySkillLevel[skillLevel] = 0;
    }

    const channel = await discord.channels.getTextChannel(config.signupChannelId);
    if (!channel) {
      await this.replies.reply({ content: "Could not find the configured Fantasy signup channel!", ephemeral: true });
      return;
    }

    const message = await channel.send({ embeds: [getSignupEmbed(season, signupCountsBySkillLevel, 0)], components: [getSignupButtonsRow()] });
    await db.setSeasonSignupMessage(season.id, channel.id, message.id);

    SeasonCloseTask.getInstance().setDate(deadline);

    await this.replies.reply(`Fantasy season started! Signups posted in <#${channel.id}>, closing ${time(deadline, TimestampStyles.RelativeTime)}.`);
  }

  /**
   * Manually triggers the close/proposal flow immediately, ahead of the signup deadline.
   */
  private async executeClose(): Promise<void> {
    const db = new FantasyDB();
    const season = await db.getCurrentSeason();
    if (!season) {
      await this.replies.reply({ content: "There is no open Fantasy season to close!", ephemeral: true });
      return;
    }

    SeasonCloseTask.getInstance().removeScheduledJob();
    await closeSeason(season.id);
    await this.replies.reply("Season close triggered! Check the admin channel for proposed rosters or any warnings.");
  }

  /**
   * Approves the currently proposed rosters, assigning Discord roles and closing the season.
   */
  private async executeApprove(): Promise<void> {
    const db = new FantasyDB();
    const season = await db.getCurrentSeason();
    if (!season) {
      await this.replies.reply({ content: "There is no active Fantasy season!", ephemeral: true });
      return;
    }

    const result = await applyApprovedRoles(season.id);
    if (result.status === "not_pending") {
      await this.replies.reply({
        content: "There are no proposed rosters waiting for approval. Run `/fantasyseason close` first.",
        ephemeral: true,
      });
      return;
    }

    if (result.status === "missing_roles") {
      await this.replies.reply({
        content: `Cannot approve, these roles don't exist and need to be created first:\n${result.missing.map((role) => `- ${role}`).join("\n")}`,
        ephemeral: true,
      });
      return;
    }

    await this.replies.reply("Rosters approved! Roles have been assigned and results posted to the signup channel.");
  }

  /**
   * Reports the current season's status and signup counts per skill level, flagging any skill level
   * that doesn't currently split evenly into valid-sized teams.
   */
  private async executeStatus(): Promise<void> {
    const db = new FantasyDB();
    const season = await db.getCurrentSeason();
    if (!season) {
      await this.replies.reply({ content: "There is no active Fantasy season!", ephemeral: true });
      return;
    }

    const lines: string[] = [
      `Status: ${season.status}`,
      `Signup deadline: ${time(season.signupDeadline, TimestampStyles.RelativeTime)}`,
      `Teams are sized ${VALID_TEAM_SIZES.join(", ")} players (mixed sizes allowed within a skill level)`,
      "",
    ];

    for (const skillLevel of Object.values(SkillLevel)) {
      const signedUp = await db.countSignupsBySkillLevel(season.id, skillLevel);
      const teamSizes = signedUp > 0 ? computeTeamSizes(signedUp, skillLevel) : [];
      const preview = teamSizes && teamSizes.length > 0 ? ` -> ${teamSizes.length} team(s) of ${teamSizes.join("/")}` : "";
      const flag = signedUp > 0 && !teamSizes ? " ⚠️ no valid team-size combination yet" : "";
      lines.push(`${skillLevel}: ${signedUp} signed up${preview}${flag}`);
    }

    const commissionerCount = (await db.getCommissionerSignups(season.id)).length;
    lines.push(`Commissioners: ${commissionerCount} signed up`);

    await this.replies.reply(lines.join("\n"));
  }

  /**
   * Moves a user's signup to a different skill level. Only works while their signup isn't yet
   * assigned to a team. Re-runs the close flow if the season was blocked on an uneven count, in case
   * this move fixed it.
   */
  private async executeMove(interaction: ChatInputCommandInteraction): Promise<void> {
    const db = new FantasyDB();
    const season = await db.getCurrentSeason();
    if (!season) {
      await this.replies.reply({ content: "There is no active Fantasy season!", ephemeral: true });
      return;
    }

    const user = this.getUserParamValue(interaction, "user");
    const skillLevel = this.getStringParamValue(interaction, "skill-level") as SkillLevel;

    const moved = await db.moveSignupSkillLevel(season.id, user.id, skillLevel);
    if (!moved) {
      await this.replies.reply({
        content: "Could not move that user. They may not be signed up, or their signup was already assigned to a team.",
        ephemeral: true,
      });
      return;
    }

    await this.replies.reply(`Moved ${user.username} to ${skillLevel}.`);

    if (season.status === SeasonStatus.CLOSING) {
      await closeSeason(season.id);
    }
  }

  /**
   * Permanently deletes the current season and all of its signups. Cancels the scheduled close task
   * and marks the posted signup message as cancelled (buttons removed). Does not touch any Discord
   * roles already granted. Requires typing "CONFIRM" to guard against accidental use.
   */
  private async executeDelete(interaction: ChatInputCommandInteraction): Promise<void> {
    const confirm = this.getStringParamValue(interaction, "confirm");
    if (confirm !== "CONFIRM") {
      await this.replies.reply({ content: 'You must enter "CONFIRM" to delete the current season.', ephemeral: true });
      return;
    }

    const db = new FantasyDB();
    const season = await db.getCurrentSeason();
    if (!season) {
      await this.replies.reply({ content: "There is no active Fantasy season to delete!", ephemeral: true });
      return;
    }

    SeasonCloseTask.getInstance().removeScheduledJob();

    if (season.signupChannelId && season.signupMessageId) {
      const cancelledEmbed = new EmbedBuilder()
        .setTitle("Fantasy Season Cancelled")
        .setColor("Grey")
        .setDescription("This Fantasy season was cancelled by an admin. Signups are closed.");
      await discord.messages.updateMessageWithEmbed(season.signupChannelId, season.signupMessageId, cancelledEmbed, true);
    }

    await db.deleteSeason(season.id);

    await this.replies.reply("Fantasy season deleted.");
  }
}
