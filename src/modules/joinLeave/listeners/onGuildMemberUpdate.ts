import ClientManager from "@common/managers/ClientManager";
import Stumper from "stumper";
import { sendCaptcha } from "../utils/Captcha";
import JoinLeaveDB from "../db/JoinLeaveDB";

export default (): void => {
  const client = ClientManager.getInstance().client;
  client.on("guildMemberUpdate", async (oldMember, newMember) => {
    const user = newMember.user;
    Stumper.info(
      `Got guildMemberUpdate for user ${user.id} old pending=${oldMember.pending} new pending=${newMember.pending}`,
      "joinLeave:onGuildMemberUpdate",
    );
    // Skip captcha for bots
    if (user.bot) {
      Stumper.info(`User ${user.id} is a bot, skipping captcha`, "joinLeave:onGuildMemberAdd");
      return;
    }

    // Check if user just completed onboarding and needs captcha
    if (!newMember.pending) {
      const db = new JoinLeaveDB();
      const notVerifiedUser = await db.getNotVerifiedUser(user.id);

      // Only proceed if user is in notVerifiedUsers and doesn't have a thread yet
      if (notVerifiedUser && !notVerifiedUser.threadId) {
        Stumper.info(`User ${user.id} completed onboarding, sending captcha`, "joinLeave:onGuildMemberUpdate");
        await sendCaptcha(user);
      }
    }
  });
};
