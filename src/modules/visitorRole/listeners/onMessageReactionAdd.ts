import { MessageReaction, PartialMessageReaction, PartialUser, User } from "discord.js";
import Stumper from "stumper";
import ClientManager from "../../../common/managers/ClientManager";
import Config from "../../../common/config/Config";
import GlobalDB from "../../../common/providers/Global.Database";
import discord from "../../../common/utils/discord/discord";

export default (): void => {
  const client = ClientManager.getInstance().client;
  client.on("messageReactionAdd", async (reaction: MessageReaction | PartialMessageReaction, user: User | PartialUser) => {
    const db = GlobalDB.getInstance();

    const vistorMessageId = db.getVisitorRoleMessageId();
    if (vistorMessageId == "") {
      return;
    }

    if (db.getVisitorRoleMessageId() != reaction.message.id) {
      return;
    }

    const member = discord.members.getMember(user.id);

    if (!member) {
      return;
    }

    const visitorRoleId = Config.getConfig().vistorReactRole.visitorRoleId;
    const memberRoleId = Config.getConfig().vistorReactRole.memberRoleId;
    const visitorEmojiId = Config.getConfig().vistorReactRole.visitorEmojiId;

    if (reaction.emoji.id == visitorEmojiId) {
      discord.roles.removeRoleToUser(member, memberRoleId);
      discord.roles.addRoleToUser(member, visitorRoleId);
      Stumper.debug(`Reaction added to message ${reaction.message.id} by user ${user.id}`, "onMessageReactionAdd");
    }
  });
};
