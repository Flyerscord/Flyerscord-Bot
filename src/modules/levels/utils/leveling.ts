import { bold, Message, userMention } from "discord.js";
import LevelsDB from "../providers/Levels.Database";
import Time from "../../../common/utils/Time";
import LevelExpDB from "../providers/LevelExp.Database";
import { getRandomNumber } from "../../../common/utils/misc";
import axios from "axios";
import { JSDOM } from "jsdom";
import Stumper from "stumper";

// Get a whole number between 15 and 25 (inclusive)
function getExpAmount(): number {
  return getRandomNumber(15, 25);
}

export async function addMessage(message: Message): Promise<void> {
  const MESSAGE_THRESHOLD = 1 * 60 * 1000;
  const db = LevelsDB.getInstance();
  const userId = message.author.id;

  db.addNewUser(userId);
  const userLevel = db.getUser(userId)!;
  Stumper.debug(
    `Time since last message: ${Time.timeSince(userLevel.timeOfLastMessage)} true? ${Time.timeSince(userLevel.timeOfLastMessage) >= MESSAGE_THRESHOLD}`,
    "addMessage",
  );

  if (Time.timeSince(userLevel.timeOfLastMessage) >= MESSAGE_THRESHOLD) {
    userLevel.messageCount++;
    userLevel.timeOfLastMessage = Time.getCurrentTime().getTime();
    userLevel.totalExp += getExpAmount();
    if (checkForLevelUp(userLevel.currentLevel, userLevel.totalExp)) {
      userLevel.currentLevel++;
      await sendLevelUpMessage(message, userId, userLevel.currentLevel);
    }
    db.updateUser(userId, userLevel);
  }
}

function checkForLevelUp(currentLevel: number, exp: number): boolean {
  const db = LevelExpDB.getInstance();
  const expToNextLevel = db.getExpUntilNextLevel(currentLevel, exp);
  return expToNextLevel <= 0;
}

async function sendLevelUpMessage(message: Message, userId: string, currentLevel: number): Promise<void> {
  const rankupMessage = `GG ${userMention(userId)}, you just advanced to ${bold(`Level ${currentLevel}`)} <:flyersflag:398273111071391744>`;
  const pNumMessage = await getPlayerNumMessage(currentLevel);

  const messages = [rankupMessage, pNumMessage];

  if (message.channel.isSendable()) {
    message.channel.send(messages.join("\n\n"));
  }
}

async function getPlayerNumMessage(pNum: number): Promise<string> {
  const output = await makeRequest(pNum);
  if (output) {
    if (output.length != 0) {
      const names = createSpacedNames(output);
      return `Flyers players that have had the number ${bold(pNum.toString())}:\n${names}`;
    } else {
      return `No Flyers player has ever had the number ${bold(pNum.toString())}!`;
    }
  }
  return "";
}

async function makeRequest(pNum: number): Promise<string | undefined> {
  try {
    const response = await axios.get(`http://www.flyershistory.com/cgi-bin/rosternum.cgi?${pNum}`);

    const dom = new JSDOM(response.data);
    const document = dom.window.document;

    const elements = document.querySelectorAll("tbody tr td a font");
    const results: string[] = [];

    elements.forEach((element) => {
      results.push(element.textContent || "");
    });

    return results.join("\n");
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
  } catch (error) {
    Stumper.error("Error fetching data", "getPlayersWithNumber");
  }
  return undefined;
}

function createSpacedNames(input: string): string {
  const spacing = 25;
  let result = "```\n";

  const names = input.split("\n");
  names.forEach((name, i) => {
    if (name == "Carter Hart") {
      name = name + " Fuck this Guy";
    }
    if (i != names.length - 1) {
      if (i % 2 == 0) {
        // Needs the spacing
        result = `${result}${name.padEnd(spacing)}`;
      } else {
        // In the second columns
        result = `${result}${name}\n`;
      }
    }
  });
  return result + "```";
}

export function getShortenedMessageCount(messageCount: number): string {
  if (messageCount < 1000) {
    return messageCount.toString();
  } else if (messageCount < 1000000) {
    const wholeNumber = Math.floor(messageCount / 1000);
    const remainder = messageCount % 1000;
    return `${wholeNumber}.${remainder.toString().slice(0, 2)}k`;
  } else {
    const wholeNumber = Math.floor(messageCount / 1000000);
    const remainder = messageCount % 1000000;
    return `${wholeNumber}.${remainder.toString().slice(0, 2)}m`;
  }
}

// Add commas to the exp number
export function formatExp(exp: number): string {
  return exp.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ",");
}
