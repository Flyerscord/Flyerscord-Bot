import Task from "@common/models/Task";
import JoinLeaveDB from "../db/JoinLeaveDB";
import Time from "@common/utils/Time";
import ConfigManager from "@common/managers/ConfigManager";
import discord from "@common/utils/discord/discord";
import MyAuditLog from "@common/utils/MyAuditLog";
import { AuditLogSeverity } from "@common/db/schema";

export default class KickNotVerifiedTask extends Task {
  constructor() {
    // Run every day at midnight
    super("KickNotVerifiedTask", "0 0 0 * * *");
  }

  protected async execute(): Promise<void> {
    const db = new JoinLeaveDB();
    const notVerifiedUsers = await db.getNotVerifiedUsers();
    const kickNotVerifiedPeriod = ConfigManager.getInstance().getConfig("JoinLeave").kickNotVerifiedPeriod;

    for (const user of notVerifiedUsers) {
      const daysSinceAdded = Time.timeSince(user.addedAt.getTime()) / 1000 / 60 / 60 / 24;
      if (daysSinceAdded >= kickNotVerifiedPeriod) {
        const member = await discord.members.getMember(user.userId, true);
        if (member) {
          void MyAuditLog.createAuditLog("JoinLeave", {
            action: "kickedNotVerifiedUser",
            userId: user.userId,
            details: {
              daysSinceAdded,
            },
            severity: AuditLogSeverity.WARNING,
          });

          await discord.members.kick(user.userId, "Not verified for 7 days");
        }
      }
    }
  }
}
