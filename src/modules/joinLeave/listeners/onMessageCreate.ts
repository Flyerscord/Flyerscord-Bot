import ClientManager from "@common/managers/ClientManager";
import { Message, bold } from "discord.js";
import JoinLeaveDB from "../db/JoinLeaveDB";
import ConfigManager from "@common/managers/ConfigManager";
import discord from "@common/utils/discord/discord";
import { sendCaptcha } from "../utils/Captcha";
import Stumper from "stumper";
import Time from "@common/utils/Time";
import { AuditLogSeverity } from "@common/db/schema";
import JoinImageGenerator from "../utils/JoinImageGenerator";

export default (): void => {
  const client = ClientManager.getInstance().client;
  client.on("messageCreate", async (message: Message) => {
    console.log(message);
    const user = message.author;
    if (user.bot) return;
    if (!message.channel.isThread()) return;
    Stumper.info("Hi there");

    const db = new JoinLeaveDB();
    const notVerifiedUser = await db.getNotVerifiedUser(user.id);

    const member = await discord.members.getMember(user.id);

    if (!notVerifiedUser || notVerifiedUser.lock || !member) {
      if (notVerifiedUser && notVerifiedUser.lock) {
        Stumper.warning(`User ${user.id} is already locked!`, "joinLeave:onMessageCreate");
      }
      Stumper.warning(`User ${user.id} is not in the not verified users table!`, "joinLeave:onMessageCreate");
      console.log("notVerifiedUser", notVerifiedUser);
      console.log("member", member);
      return;
    }

    if (message.channel.id !== notVerifiedUser.threadId) {
      return;
    }

    // Lock the user to prevent processing multiple answers
    const lockAcquired = await db.tryLockUser(user.id);
    if (!lockAcquired) {
      Stumper.warning(`User ${user.id} is already locked!`, "joinLeave:onMessageCreate");
      return;
    }

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

          const member = await discord.members.getMember(user.id, true);
          if (!member) {
            Stumper.error(
              `User ${user.id} is not in the server, skipping removal of not verified role and adding back roles`,
              "joinLeave:onMessageCreate",
            );
          } else {
            // Remove the role from the user
            const notVerifiedRoleId = ConfigManager.getInstance().getConfig("JoinLeave").notVerifiedRoleId;
            await discord.roles.removeRoleFromUser(member, notVerifiedRoleId);
            const leftUser = await db.getLeftUser(user.id);

            const adminNotificationChannelId = ConfigManager.getInstance().getConfig("JoinLeave").joinLeaveAdminNotificationChannelId;
            void discord.messages.sendMessageToChannel(adminNotificationChannelId, `<@${user.id}> has verified!`);

            // Send the welcome message
            const username = member.displayName || member.user.username;
            const message = `<@${member.id}>\nWelcome${leftUser !== undefined ? " back" : ""} to the ${bold("Go Flyers")}!! Rule #1: Fuck the Pens!`;
            const joinImageGenerator = new JoinImageGenerator(username, member.displayAvatarURL(), discord.members.getNumberOfMembers());
            let joinPhoto: Buffer;
            try {
              joinPhoto = await joinImageGenerator.getImage();
              await discord.messages.sendMessageAndImageBufferToChannel(
                ConfigManager.getInstance().getConfig("JoinLeave").channelId,
                message,
                joinPhoto,
              );
            } catch (error) {
              Stumper.caughtError(error, "joinLeave:onGuildMemberAdd");
            }

            // If they were a previously left user add back their roles
            if (leftUser) {
              Stumper.info(`User ${user.id} was previously left, adding their roles back`, "joinLeave:onMessageCreate");
              const roles = leftUser.roles;
              for (const role of roles) {
                if (role === notVerifiedRoleId) {
                  Stumper.warning(`User ${user.id} had previously left with the not verified role, skipping`, "joinLeave:onMessageCreate");
                  continue;
                }
                Stumper.info(`Adding back role ${role} to user ${user.id}`, "joinLeave:onMessageCreate");
                await discord.roles.addRoleToUser(member, role);
              }
              await db.deleteLeftUser(user.id);
            }
          }

          // Delete the not verified user
          await db.deleteNotVerifiedUser(user.id);

          // Delete the thread
          if (notVerifiedUser.threadId) {
            await discord.threads.deleteThread(notVerifiedUser.threadId, "User completed captcha");
          }
        } else {
          await message.reply("Correct!");

          await db.unlockUser(user.id);
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
            if (notVerifiedUser.threadId) {
              await discord.threads.deleteThread(notVerifiedUser.threadId, "User banned due to failing captcha");
            }
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
