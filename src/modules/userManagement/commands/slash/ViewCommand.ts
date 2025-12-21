import { ChatInputCommandInteraction, EmbedBuilder, time, TimestampStyles, User } from "discord.js";
import { AdminSlashCommand, PARAM_TYPES } from "@common/models/SlashCommand";
import UserManagementDB from "../../providers/UserManagement.Database";
import { IUserInfo } from "../../interfaces/IUserInfo";
import discord from "@common/utils/discord/discord";
import Time from "@common/utils/Time";
import Stumper from "stumper";

export default class ViewCommand extends AdminSlashCommand {
  constructor() {
    super("userview", "View info for a user", { ephermal: true });

    this.data
      .addUserOption((option) => option.setName("user").setDescription("The user to ge the info for").setRequired(true))
      .addStringOption((option) =>
        option
          .setName("view")
          .setDescription("What info to view, shows summary if not included")
          .setRequired(false)
          .setChoices({ name: "Warnings", value: "warnings" }, { name: "Notes", value: "notes" }),
      );
  }

  async execute(interaction: ChatInputCommandInteraction): Promise<void> {
    const user: User = this.getParamValue(interaction, PARAM_TYPES.USER, "user");
    const view: string = this.getParamValue(interaction, PARAM_TYPES.STRING, "view");

    const db = UserManagementDB.getInstance();
    const userInfo: IUserInfo = db.getUser(user.id);

    const embed = await createEmbed(userInfo, view);
    if (embed) {
      await this.replies.reply({ embeds: [embed] });
    } else {
      await this.replies.reply("There was an error finding the info for the user!");
    }
  }
}

async function createEmbed(userInfo: IUserInfo, view: string): Promise<EmbedBuilder | undefined> {
  const embed = new EmbedBuilder();
  const member = await discord.members.getMember(userInfo.userId);

  if (!member) {
    Stumper.error(`Error finding member for user ${userInfo.userId}`, "userManagement:ViewCommand:createEmbed");
    return undefined;
  }
  const user = member.user;

  if (view == "warnings") {
    embed.setTitle(`Warnings`);
    embed.setColor("Orange");

    const warnings = userInfo.warnings;
    for (let i = 0; i < warnings.length; i++) {
      const warning = warnings[i];
      const addedBy = await discord.members.getMember(warning.addedBy);
      if (!addedBy) {
        Stumper.error(`Error finding member for user ${warning.addedBy}`, "userManagement:ViewCommand:createEmbed");
        return undefined;
      }
      const addedByUsername = addedBy.displayName || addedBy.user.username;
      embed.addFields({ name: `${i + 1} (${addedByUsername}): ${Time.getFormattedDate(Time.getDate(warning.date))}`, value: warning.reason });
    }
  } else if (view == "notes") {
    embed.setTitle(`Notes`);
    embed.setColor("Blue");

    const notes = userInfo.notes;
    for (let i = 0; i < notes.length; i++) {
      const note = notes[i];
      const addedBy = await discord.members.getMember(note.addedBy);
      if (!addedBy) {
        Stumper.error(`Error finding member for user ${note.addedBy}`, "userManagement:ViewCommand:createEmbed");
        return undefined;
      }
      const addedByUsername = addedBy.displayName || addedBy.user.username;
      embed.addFields({ name: `${i + 1} (${addedByUsername}): ${Time.getFormattedDate(Time.getDate(note.date))}`, value: note.reason });
    }
  } else {
    embed.setTitle("User Info");
    embed.setColor("Grey");

    embed.addFields({ name: "User ID", value: `${userInfo.userId}` });

    if (member.joinedAt) {
      embed.addFields({ name: "Joined Server", value: time(member.joinedAt, TimestampStyles.RelativeTime) });
    }

    embed.addFields({ name: "Account Created", value: time(user.createdAt, TimestampStyles.RelativeTime) });

    embed.addFields({ name: "Number of warnings", value: `${userInfo.warnings.length}` });
    embed.addFields({ name: "Number of notes", value: `${userInfo.notes.length}` });
  }

  embed.setAuthor({ name: member.displayName || user.username, iconURL: member.displayAvatarURL() || user.displayAvatarURL() });
  embed.setTimestamp(Time.getCurrentTime());

  return embed;
}
