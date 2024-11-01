import { MessageReaction, PartialMessageReaction, PartialUser, User } from "discord.js";
import Stumper from "stumper";
import ClientManager from "../../../common/managers/ClientManager";
import Config from "../../../common/config/Config";
import GlobalDB from "../../../common/providers/Global.Database";
import discord from "../../../common/utils/discord/discord";

export default (): void => {
  const client = ClientManager.getInstance().client;
  client.on("messageReactionRemove", async (reaction: MessageReaction | PartialMessageReaction, user: User | PartialUser) => {
    if (user.bot) return;

    const db = GlobalDB.getInstance();

    const bagMessageId = db.getBagRoleMessageId();
    if (bagMessageId == "" || bagMessageId != reaction.message.id) {
      return;
    }

    const member = await discord.members.getMember(user.id);

    if (!member) {
      Stumper.error(`Error finding member for user ${user.id}`, "bagReactionRole:onMessageReactionRemove");
      return;
    }

    const bagRoleId = Config.getConfig().bagReactionRole.roleId;
    const bagEmojiId = Config.getConfig().bagReactionRole.emojiId;

    if (reaction.emoji.id == bagEmojiId) {
      discord.roles.removeRoleToUser(member, bagRoleId);
      Stumper.debug(`Reaction removed from message ${reaction.message.id} by user ${user.id}`, "bagReactionRole:onMessageReactionRemove");
    }
  });
};
