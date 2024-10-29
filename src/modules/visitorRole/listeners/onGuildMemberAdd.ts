import { GuildMember } from "discord.js";
import Stumper from "stumper";
import Config from "../../../common/config/Config.ts";
import ClientManager from "../../../common/managers/ClientManager.ts";

export default (): void => {
  const client = ClientManager.getInstance().client;
  client.on("guildMemberAdd", async (member: GuildMember) => {
    const memberRoleId = Config.getConfig().vistorReactRole.memberRoleId;
    if (!member.roles.cache.has(memberRoleId)) {
      Stumper.info(`Adding member role to user: ${member.displayName}`, "guildMemberAdd");
      member.roles.add(memberRoleId);
    }
  });
};
