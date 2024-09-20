import { Message, EmbedBuilder } from "discord.js";
import LevelsDB from "../providers/Levels.Database";
import Time from "../../../common/utils/Time";
import LevelExpDB from "../providers/LevelExp.Database";
import { getRandomNumber } from "../../../common/utils/misc";

// Get a whole number between 15 and 25 (inclusive)
function getExpAmount(): number {
  return getRandomNumber(15, 25);
}

export function addMessage(message: Message): void {
  const MESSAGE_THRESHOLD = 1 * 60 * 1000;
  const db = LevelsDB.getInstance();
  const userId = message.author.id;

  db.addNewUser(userId);
  const userLevel = db.getUser(userId)!;

  if (Time.timeSince(userLevel.timeOfLastMessage) >= MESSAGE_THRESHOLD) {
    userLevel.messageCount++;
    userLevel.timeOfLastMessage = Time.getCurrentTime().getTime();
    userLevel.totalExp += getExpAmount();
    if (checkForLevelUp(userLevel.currentLevel, userLevel.totalExp)) {
      userLevel.currentLevel++;
      sendLevelUpMessage(message, userId, userLevel.currentLevel);
    }
    db.updateUser(userId, userLevel);
  }
}

function checkForLevelUp(currentLevel: number, exp: number): boolean {
  const db = LevelExpDB.getInstance();
  const expToNextLevel = db.getExpUntilNextLevel(currentLevel, exp);
  return expToNextLevel >= 0;
}

function sendLevelUpMessage(message: Message, userId: string, currentLevel: number): void {
  const rankupMessage = `GG <@${userId}>, you just advanced to **Level ${currentLevel}** <:flyersflag:398273111071391744>`;

  if (message.channel.isSendable()) {
    message.channel.send(rankupMessage);
  }
}
