import { GuildMember } from "discord.js";
import Stumper from "stumper";
import ClientManager from "@common/managers/ClientManager";
import ConfigManager from "@common/managers/ConfigManager";
import VisitorRoleDB from "../db/VisitorRoleDB";

export default (): void => {
  const client = ClientManager.getInstance().client;
  client.on("guildMemberAdd", async (member: GuildMember) => {
    if (member.user.bot) return;

    const memberRoleId = ConfigManager.getInstance().getConfig("VisitorRole").memberRoleId;
    if (!member.roles.cache.has(memberRoleId)) {
      const db = new VisitorRoleDB();

      void db.createAuditLog({
        action: "MemberRoleAdded",
        userId: member.user.id,
        details: {
          memberId: member.id,
          memberName: member.displayName,
        },
      });

      Stumper.info(`Adding member role to user: ${member.displayName}`, "visitorRole:onGuildMemberAdd");
      await member.roles.add(memberRoleId);
    }
  });
};
