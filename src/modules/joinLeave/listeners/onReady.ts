import ClientManager from "@common/managers/ClientManager";
import { sendCaptcha } from "../utils/Captcha";
import JoinLeaveDB from "../db/JoinLeaveDB";
import discord from "@common/utils/discord/discord";
import Stumper from "stumper";
import { AuditLogSeverity } from "@common/db/schema";

export default (): void => {
  const client = ClientManager.getInstance().client;
  client.on("clientReady", async () => {
    const db = new JoinLeaveDB();
    const nonVerifiedUsers = await db.getNotVerifiedUsers();
    for (const user of nonVerifiedUsers) {
      if (!user.threadId) {
        const discordUser = await discord.users.getUser(user.userId, true);
        if (!discordUser) {
          Stumper.error(`User ${user.userId} not found!`, "joinLeave:onReady");
          continue;
        }
        Stumper.info(`User ${user.userId} doesn't have a captcha thread, creating one!`, "joinLeave:onReady");
        void sendCaptcha(discordUser);
        void db.createAuditLog({
          action: "createdCaptchaThreadOnStartup",
          userId: user.userId,
          severity: AuditLogSeverity.WARNING,
        });
      }
    }
  });
};
