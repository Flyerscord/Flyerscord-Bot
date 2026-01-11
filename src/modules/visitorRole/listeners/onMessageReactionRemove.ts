import { MessageReaction, PartialMessageReaction, PartialUser, User } from "discord.js";
import Stumper from "stumper";
import ClientManager from "@common/managers/ClientManager";
import discord from "@common/utils/discord/discord";
import ConfigManager from "@common/managers/ConfigManager";
import VisitorRoleDB from "../db/VisitorRoleDB";

export default (): void => {
  const client = ClientManager.getInstance().client;
  client.on("messageReactionRemove", async (reaction: MessageReaction | PartialMessageReaction, user: User | PartialUser) => {
    if (user.bot) return;

    const db = new VisitorRoleDB();

    const vistorMessageId = await db.getVisitorRoleMessageId();
    if (vistorMessageId == "") {
      return;
    }

    if ((await db.getVisitorRoleMessageId()) != reaction.message.id) {
      return;
    }

    const member = await discord.members.getMember(user.id);

    if (!member) {
      Stumper.error(`Error finding member for user ${user.id}`, "visitorRole:onMessageReactionRemove");
      return;
    }

    const config = ConfigManager.getInstance().getConfig("VisitorRole");

    const visitorRoleId = config.visitorRoleId;
    const memberRoleId = config.memberRoleId;
    const visitorEmojiId = config.visitorEmojiId;

    if (reaction.emoji.id == visitorEmojiId) {
      await discord.roles.removeRoleToUser(member, visitorRoleId);
      await discord.roles.addRoleToUser(member, memberRoleId);
      Stumper.debug(`Reaction removed from message ${reaction.message.id} by user ${user.id}`, "visitorRole:onMessageReactionRemove");
    }
  });
};
