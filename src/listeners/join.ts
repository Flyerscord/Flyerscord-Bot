import { Client, GuildMember } from "discord.js";
import Stumper from "stumper";

import Config from "../config/Config";

export default (client: Client): void => {
  client.on("guildMemberAdd", async (member: GuildMember) => {
    const memberRoleId = Config.getConfig().vistorReactRole.memberRoleId;
    if (!member.roles.cache.has(memberRoleId)) {
      Stumper.info(`Adding member role to user: ${member.displayName}`, "guildMemberAdd");
      member.roles.add(memberRoleId);
    }
  });
};
