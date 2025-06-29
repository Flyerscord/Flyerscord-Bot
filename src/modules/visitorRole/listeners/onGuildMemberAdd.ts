import { GuildMember } from "discord.js";
import Stumper from "stumper";
import ClientManager from "../../../common/managers/ClientManager";
import ConfigManager from "@common/config/ConfigManager";

export default (): void => {
  const client = ClientManager.getInstance().client;
  client.on("guildMemberAdd", async (member: GuildMember) => {
    if (member.user.bot) return;

    const memberRoleId = ConfigManager.getInstance().getConfig("VisitorRole").memberRoleId;
    if (!member.roles.cache.has(memberRoleId)) {
      Stumper.info(`Adding member role to user: ${member.displayName}`, "visitorRole:onGuildMemberAdd");
      member.roles.add(memberRoleId);
    }
  });
};
