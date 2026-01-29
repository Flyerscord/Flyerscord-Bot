import ClientManager from "@common/managers/ClientManager";
import Stumper from "stumper";
import { sendCaptcha } from "../utils/Captcha";
import JoinLeaveDB from "../db/JoinLeaveDB";

export default (): void => {
  const client = ClientManager.getInstance().client;
  client.on("guildMemberUpdate", async (oldMember, newMember) => {
    const user = newMember.user;
    // Skip captcha for bots
    if (user.bot) {
      Stumper.info(`User ${user.id} is a bot, skipping captcha`, "joinLeave:onGuildMemberAdd");
      return;
    }

    if (oldMember.pending && !newMember.pending) {
      const db = new JoinLeaveDB();
      const notVerifiedUser = await db.getNotVerifiedUser(user.id);
      if (!notVerifiedUser) {
        Stumper.error(
          `User ${user.id} is not in the not verified users table! They are either already verified or there is another error!`,
          "joinLeave:onGuildMemberUpdate",
        );
        return;
      }
      await sendCaptcha(user);
    }
  });
};
