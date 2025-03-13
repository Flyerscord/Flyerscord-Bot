import { MessageReaction, PartialMessageReaction, PartialUser, User } from "discord.js";
import Stumper from "stumper";
import ClientManager from "../../../common/managers/ClientManager";
import GlobalDB from "../../../common/providers/Global.Database";
import discord from "../../../common/utils/discord/discord";
import VisitorRoleModule from "../VisitorRoleModule";

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

    const visitorRoleId = VisitorRoleModule.getInstance().config.visitorRoleId;
    const memberRoleId = VisitorRoleModule.getInstance().config.memberRoleId;
    const visitorEmojiId = VisitorRoleModule.getInstance().config.visitorEmojiId;

    if (reaction.emoji.id == visitorEmojiId) {
      discord.roles.removeRoleToUser(member, memberRoleId);
      discord.roles.addRoleToUser(member, visitorRoleId);
      Stumper.debug(`Reaction added to message ${reaction.message.id} by user ${user.id}`, "visitorRole:onMessageReactionAdd");
    }
  });
};
