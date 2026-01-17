import ClientManager from "@common/managers/ClientManager";
import { Message } from "discord.js";
import JoinLeaveDB from "../db/JoinLeaveDB";
import ConfigManager from "@common/managers/ConfigManager";
import discord from "@common/utils/discord/discord";
import { sendCaptcha } from "../utils/Captcha";
import Stumper from "stumper";
import Time from "@common/utils/Time";
import { AuditLogSeverity } from "@common/db/schema";

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

    try {
      const questions = ConfigManager.getInstance().getConfig("JoinLeave").captchaQuestions;
      if (questions.length <= notVerifiedUser.questionsAnswered) {
        return;
      }

      const currentTimeout = await db.getTimeout(user.id);
      const timeoutCooldown = ConfigManager.getInstance().getConfig("JoinLeave").incorrectAnswersTimeout;
      if (currentTimeout) {
        const timeSinceTimeoutMilli = Time.timeSince(currentTimeout.getTime());
        const timeUntilTimeoutSec = Math.floor(timeSinceTimeoutMilli / 1000);
        if (timeUntilTimeoutSec < timeoutCooldown) {
          void db.createAuditLog({
            action: "messageSentWhileTimedOut",
            userId: user.id,
            severity: AuditLogSeverity.WARNING,
            details: {
              messageId: message.id,
              content: message.content,
              timeUntilTimeoutSec,
            },
          });
          Stumper.warning(
            `User ${user.id} has to wait ${timeoutCooldown - timeUntilTimeoutSec} seconds before answering again`,
            "joinLeave:onMessageCreate",
          );
          await message.reply(`You have to wait ${timeoutCooldown - timeUntilTimeoutSec} seconds before answering again.`);
          return;
        } else {
          await db.createAuditLog({
            action: "timeOutRemoved",
            userId: user.id,
            severity: AuditLogSeverity.INFO,
          });
          await db.removeTimeout(user.id);
          await db.resetIncorrectAnswers(user.id);
        }
      }

      const content = message.content.toLowerCase();
      const question = questions[notVerifiedUser.questionsAnswered].question;
      const answer = questions[notVerifiedUser.questionsAnswered].answer;
      const maxAnswerLength = ConfigManager.getInstance().getConfig("JoinLeave").maxAnswerLength;

      // Check if the answer is correct and if the message is less than the configured max answer length
      // The threshold characters makes sure the answer is not a huge list of words
      if (content.includes(answer) && content.length <= maxAnswerLength) {
        await db.incrementQuestionsAnswered(user.id);

        await db.createAuditLog({
          action: "captchaCorrect",
          userId: user.id,
          severity: AuditLogSeverity.INFO,
          details: {
            messageId: message.id,
            content: message.content,
            question,
            answer,
          },
        });

        if (notVerifiedUser.questionsAnswered + 1 >= questions.length) {
          void db.createAuditLog({
            action: "userVerified",
            userId: user.id,
            severity: AuditLogSeverity.INFO,
            details: {
              messageId: message.id,
              content: message.content,
            },
          });

          await message.reply("Correct! You are now verified!");

          // Remove the role from the user
          const notVerifiedRoleId = ConfigManager.getInstance().getConfig("JoinLeave").notVerifiedRoleId;
          await discord.roles.removeRoleFromUser(member, notVerifiedRoleId);

          // Delete the not verified user
          await db.deleteNotVerifiedUser(user.id);
        } else {
          await message.reply("Correct!");

          // Send the next question
          await sendCaptcha(user);
        }
      } else {
        await db.createAuditLog({
          action: "captchaIncorrect",
          userId: user.id,
          severity: AuditLogSeverity.WARNING,
          details: {
            messageId: message.id,
            content: message.content,
            question,
            answer,
          },
        });

        await db.incrementIncorrectAnswers(user.id);
        const incorrectAnswerThreshold = ConfigManager.getInstance().getConfig("JoinLeave").maxIncorrectAnswers;
        const incorrectAnswers = await db.getIncorrectAnswers(user.id);
        const timeoutLength = ConfigManager.getInstance().getConfig("JoinLeave").incorrectAnswersTimeout;
        const timeoutHours = Math.floor(timeoutLength / 3600);

        const totalTimeOuts = await db.getTimeOutCount(user.id);
        const maxTimeOuts = ConfigManager.getInstance().getConfig("JoinLeave").maxTimeOuts;

        // Check if the user should be timed out
        if (incorrectAnswers >= incorrectAnswerThreshold) {
          // Check if the user has reached the maximum number of timeouts
          if (totalTimeOuts + 1 > maxTimeOuts) {
            // User has reached the maximum number of timeouts, ban them
            void db.createAuditLog({
              action: "captchaBan",
              userId: user.id,
              severity: AuditLogSeverity.CRITICAL,
              details: {
                totalTimeOuts: totalTimeOuts + 1,
                maxTimeOuts,
              },
            });
            await message.reply(`You have reached the maximum number of timeouts! You have been banned from the server.`);
            await discord.members.banUser(user.id, { reason: "Reached the maximum number of captcha timeouts" });
            await db.deleteNotVerifiedUser(user.id);
            return;
          } else {
            // User has not reached the maximum number of timeouts, start a timeout
            void db.createAuditLog({
              action: "captchaTimeout",
              userId: user.id,
              severity: AuditLogSeverity.WARNING,
              details: {
                totalTimeOuts: totalTimeOuts + 1,
                maxTimeOuts,
              },
            });
            await db.startTimeout(user.id);
            await db.incrementTimeOutCount(user.id);
            await message.reply(`Wrong! You have reached the maximum number of incorrect answers! Try again in ${timeoutHours} hours.`);
          }
        } else {
          // Incorrect answer, but the user has not reached the maximum number of wrong answers
          await message.reply("Incorrect! Try again.");
        }
      }
    } catch (error) {
      Stumper.caughtError(error, "joinLeave:onMessageCreate");
    } finally {
      await db.unlockUser(user.id);
    }
  });
};
