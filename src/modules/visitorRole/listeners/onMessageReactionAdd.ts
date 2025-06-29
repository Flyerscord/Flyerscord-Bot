import { MessageReaction, PartialMessageReaction, PartialUser, User } from "discord.js";
import Stumper from "stumper";
import ClientManager from "@common/managers/ClientManager";
import GlobalDB from "@common/providers/Global.Database";
import discord from "@common/utils/discord/discord";
import ConfigManager from "@common/config/ConfigManager";

export default (): void => {
  const client = ClientManager.getInstance().client;
  client.on("messageReactionAdd", async (reaction: MessageReaction | PartialMessageReaction, user: User | PartialUser) => {
    if (user.bot) return;

    const db = GlobalDB.getInstance();

    const vistorMessageId = db.getVisitorRoleMessageId();
    if (vistorMessageId == "") {
      return;
    }

    if (db.getVisitorRoleMessageId() != reaction.message.id) {
      return;
    }

    const member = await discord.members.getMember(user.id);

    if (!member) {
      return;
    }

    const config = ConfigManager.getInstance().getConfig("VisitorRole");

    const visitorRoleId = config.visitorRoleId;
    const memberRoleId = config.memberRoleId;
    const visitorEmojiId = config.visitorEmojiId;

    if (reaction.emoji.id == visitorEmojiId) {
      discord.roles.removeRoleToUser(member, memberRoleId);
      discord.roles.addRoleToUser(member, visitorRoleId);
      Stumper.debug(`Reaction added to message ${reaction.message.id} by user ${user.id}`, "visitorRole:onMessageReactionAdd");
    }
  });
};
