import ConfigManager from "@common/managers/ConfigManager";
import { EmbedBuilder, User } from "discord.js";
import JoinLeaveDB from "../db/JoinLeaveDB";
import Stumper from "stumper";
import discord from "@common/utils/discord/discord";

export async function sendCaptcha(user: User): Promise<void> {
  const questions = ConfigManager.getInstance().getConfig("JoinLeave").captchaQuestions;

  const db = new JoinLeaveDB();

  const notVerifiedUser = await db.getNotVerifiedUser(user.id);

  if (!notVerifiedUser) {
    Stumper.error(
      `User ${user.id} is not in the not verified users table! They are either already verified or there is another error!`,
      "joinLeave:sendCaptcha",
    );
    return;
  }

  if (notVerifiedUser.questionsAnswered >= questions.length) {
    Stumper.error(`User ${user.id} has already answered all the questions!`, "joinLeave:sendCaptcha");
    return;
  }

  const embed = getCaptchaEmbed(questions[notVerifiedUser.questionsAnswered].question);
  await discord.messages.sendEmbedDMToUser(user.id, embed);
}

function getCaptchaEmbed(question: string): EmbedBuilder {
  const embed = new EmbedBuilder();

  embed.setTitle("Captcha");
  embed.setDescription("Before you can take part in the Go Flyers server, you must complete a captcha. Answer the following question to continue.");

  embed.addFields({ name: "Question", value: question });

  return embed;
}
