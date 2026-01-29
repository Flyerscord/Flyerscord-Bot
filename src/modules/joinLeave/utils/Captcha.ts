import ConfigManager from "@common/managers/ConfigManager";
import { EmbedBuilder, User } from "discord.js";
import JoinLeaveDB from "../db/JoinLeaveDB";
import Stumper from "stumper";
import discord from "@common/utils/discord/discord";
import { sleepSec } from "@common/utils/sleep";

export async function sendCaptcha(user: User): Promise<void> {
  const questions = ConfigManager.getInstance().getConfig("JoinLeave").captchaQuestions;
  const notVerifiedChannelId = ConfigManager.getInstance().getConfig("JoinLeave").notVerifiedChannelId;

  const db = new JoinLeaveDB();

  const notVerifiedUser = await db.getNotVerifiedUser(user.id);

  if (!notVerifiedUser) {
    Stumper.error(
      `User ${user.id} is not in the not verified users table! They are either already verified or there is another error!`,
      "joinLeave:sendCaptcha",
    );
    return;
  }

  // Create thread if it doesn't exist
  if (!notVerifiedUser.threadId) {
    const thread = await discord.threads.createPrivateThread(notVerifiedChannelId, `${user.username}'s Captcha Thread`, {
      autoArchiveDuration: 10080,
      reason: "Created by Flyerscord Bot for user to answer captcha",
    });

    if (!thread) {
      Stumper.error(`Error creating thread for user ${user.id}`, "joinLeave:sendCaptcha");
      return;
    }

    // Add the user to the thread with retries
    let result = await discord.threads.addThreadMember(thread.id, user.id);
    let attempts = 0;
    const maxAttempts = 12;
    while (!result && attempts < maxAttempts) {
      Stumper.warning(`Failed to add user ${user.id} to thread ${thread.id}, retrying... (${attempts + 1}/${maxAttempts})`, "joinLeave:sendCaptcha");
      await sleepSec(5);
      result = await discord.threads.addThreadMember(thread.id, user.id);
      attempts++;
    }

    await db.setThreadId(user.id, thread.id);
    notVerifiedUser.threadId = thread.id;

    // Ping the user
    await discord.messages.sendMessageToThread(notVerifiedUser.threadId, `<@${user.id}>`);
  }

  if (notVerifiedUser.questionsAnswered >= questions.length) {
    Stumper.error(`User ${user.id} has already answered all the questions!`, "joinLeave:sendCaptcha");
    return;
  }

  const embed = getCaptchaEmbed(questions[notVerifiedUser.questionsAnswered].question);
  await discord.messages.sendEmbedToThread(notVerifiedUser.threadId, embed);
}

function getCaptchaEmbed(question: string): EmbedBuilder {
  const embed = new EmbedBuilder();

  embed.setTitle("Captcha");
  embed.setDescription("Before you can take part in the Go Flyers server, you must complete a captcha. Answer the following question to continue.");

  embed.addFields({ name: "Question", value: question });

  return embed;
}
