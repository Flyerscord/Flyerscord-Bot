import ClientManager from "@common/managers/ClientManager";
import Stumper from "stumper";
import { sendCaptcha } from "../utils/Captcha";
import JoinLeaveDB from "../db/JoinLeaveDB";

export default (): void => {
  const client = ClientManager.getInstance().client;
  client.on("guildMemberUpdate", async (_oldMember, newMember) => {
    // Check if user just completed onboarding and needs captcha
    if (!newMember.pending) {
      const user = newMember.user;
      // Skip captcha for bots
      if (user.bot) {
        return;
      }
      const db = new JoinLeaveDB();
      const notVerifiedUser = await db.getNotVerifiedUser(user.id);

      // Only proceed if user is in notVerifiedUsers and doesn't have a thread yet
      if (notVerifiedUser && !notVerifiedUser.threadId && !notVerifiedUser.lock) {
        Stumper.info(`User ${user.id} completed onboarding, sending captcha`, "joinLeave:onGuildMemberUpdate");
        // Lock the user to prevent them from sending another captcha
        await db.lockUser(user.id);
        await sendCaptcha(user);
      }
    }
  });
};
