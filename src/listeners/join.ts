import { Client, GuildMember } from "discord.js";

import Config from "../config/Config";
import Logger from "../util/Logger";

export default (client: Client): void => {
  client.on("guildMemberAdd", async (member: GuildMember) => {
    const memberRoleId = Config.getConfig().vistorReactRole.memberRoleId;
    if (!member.roles.cache.has(memberRoleId)) {
      Logger.info(`Adding member role to user: ${member.displayName}`, "guildMemberAdd");
      member.roles.add(memberRoleId);
    }
  });
};
