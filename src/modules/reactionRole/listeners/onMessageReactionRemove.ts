import { MessageReaction, PartialMessageReaction, PartialUser, User } from "discord.js";
import Stumper from "stumper";
import ClientManager from "@common/managers/ClientManager";
import discord from "@common/utils/discord/discord";
import ConfigManager from "@common/managers/ConfigManager";
import ReactionRoleDB from "../db/ReactionRoleDB";

export default (): void => {
  const client = ClientManager.getInstance().client;
  client.on("messageReactionRemove", async (reaction: MessageReaction | PartialMessageReaction, user: User | PartialUser) => {
    if (user.bot) return;

    const db = new ReactionRoleDB();

    const messageId = reaction.message.id;

    const reactionName = await db.getNameByMessageId(messageId);

    // Check if the message is a reaction role message
    if (!reactionName) {
      return;
    }

    const reactionRole = ConfigManager.getInstance()
      .getConfig("ReactionRole")
      .reactionRoles.find((reactionRole) => reactionRole.name == reactionName);

    if (!reactionRole) {
      Stumper.error(`Reaction role not found with name ${reactionName}`, "reactionRole:onMessageReactionRemove");
      return;
    }

    const member = await discord.members.getMember(user.id);

    if (!member) {
      Stumper.error(`Error finding member for user ${user.id}`, "reactionRole:onMessageReactionRemove");
      return;
    }

    if (reaction.emoji.id == reactionRole.emojiId) {
      void db.createAuditLog({
        action: "ReactionRoleRemoved",
        userId: user.id,
        details: {
          reactionName,
          emojiId: reaction.emoji.id,
          channelId: reaction.message.channelId,
          messageId,
        },
      });

      await discord.roles.removeRoleToUser(member, reactionRole.roleId);
      Stumper.debug(`Reaction removed from reaction role ${reactionName} by user ${user.id}`, "reactionRole:onMessageReactionRemove");
    }
  });
};
