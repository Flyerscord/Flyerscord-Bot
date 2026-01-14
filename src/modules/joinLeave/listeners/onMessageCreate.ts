import ClientManager from "@common/managers/ClientManager";
import { Message } from "discord.js";
import JoinLeaveDB from "../db/JoinLeaveDB";
import ConfigManager from "@common/managers/ConfigManager";
import discord from "@common/utils/discord/discord";
import { sendCaptcha } from "../utils/Captcha";

export default (): void => {
  const client = ClientManager.getInstance().client;
  client.on("messageCreate", async (message: Message) => {
    const user = message.author;
    if (user.bot) return;
    if (!message.channel.isDMBased()) return;

    const db = new JoinLeaveDB();
    const notVerifiedUser = await db.getNotVerifiedUser(user.id);

    const member = await discord.members.getMember(user.id);

    if (!notVerifiedUser || notVerifiedUser.lock || !member) {
      return;
    }

    await db.lockUser(user.id);

    const questions = ConfigManager.getInstance().getConfig("JoinLeave").captchaQuestions;
    if (questions.length <= notVerifiedUser.questionsAnswered) {
      await db.unlockUser(user.id);
      return;
    }

    const content = message.content.toLowerCase();
    const answer = questions[notVerifiedUser.questionsAnswered].answer;
    const maxAnswerLength = ConfigManager.getInstance().getConfig("JoinLeave").maxAnswerLength;

    // Check if the answer is correct and if the message is less than the configured max answer length
    // The threshold characters makes sure the answer is not a huge list of words
    if (content.includes(answer) && content.length <= maxAnswerLength) {
      await db.incrementQuestionsAnswered(user.id);

      if (notVerifiedUser.questionsAnswered + 1 >= questions.length) {
        await message.reply("Correct! You are now verified!");

        // Remove the role from the user
        const notVerifiedRoleId = ConfigManager.getInstance().getConfig("JoinLeave").notVerifiedRoleId;
        await discord.roles.removeRoleFromUser(member, notVerifiedRoleId);

        // Delete the not verified user
        await db.deleteNotVerifiedUser(user.id);
      } else {
        // Send the next question
        await sendCaptcha(user);
      }
    }
    await db.unlockUser(user.id);
  });
};
