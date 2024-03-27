import { Client, Message } from "discord.js";

import Config from "../config/Config";
import TextCommand from "../models/TextCommand";
import Stumper from "stumper";
import CustomCommandsDB from "../providers/CustomCommands.Database";

export default (client: Client): void => {
  client.on("messageCreate", async (message: Message) => {
    addToLevels(message);

    if (checkForHart(message)) return;
    if (checkForHyperBedtime(message)) return;
    if (checkForCustomTextCommand(message)) return;
    if (checkForNormalTextCommand(message)) return;
  });
};

function addToLevels(message: Message): void {
  if (message.author.bot) return;
  if (!message.channel.isTextBased()) return;
}

function checkForHart(message: Message): boolean {
  if (message.author.bot) return false;
  if (!message.channel.isTextBased()) return false;

  const regex = new RegExp("\\b(carter|hart)\\b", "g");
  const matches = message.content.toLowerCase().match(regex);
  if (matches) {
    if (!message.content.toLowerCase().includes("jeff")) {
      Stumper.info("Sending Fuck Carter Hart message!", "checkForHart");
      message.channel.send("Fuck Carter Hart!");
      return true;
    }
  }
  return false;
}

function checkForHyperBedtime(message: Message): boolean {
  const hysterUserId = "811967964819619911";
  if (message.author.bot) return false;
  if (!message.channel.isTextBased()) return false;
  if (message.author.id != hysterUserId) return false;

  const currTime = new Date();
  const currentHour = currTime.getHours();
  if (currentHour >= 0 && currentHour < 8) {
    Stumper.info("Sending hyster bedtime message!", "checkForHyperBedtime");
    message.channel.send(`@${hysterUserId} Go to bed!`);
    return true;
  }
  return false;
}

function checkForNormalTextCommand(message: Message): boolean {
  const prefix = Config.getConfig().prefixes.normal;
  if (message.author.bot) return false;
  if (!message.channel.isTextBased()) return false;
  if (!message.content.startsWith(prefix)) return false;

  const messageArray = message.content.split(" ");
  const command = messageArray[0];
  const args = messageArray.slice(1);

  const textCmd: TextCommand = message.client.textCommands.get(command.slice(prefix.length));
  try {
    if (textCmd) {
      textCmd.execute(message, args);
      Stumper.info(`Command ${command} called!`, "checkForNormalTextCommand");
      return true;
    }
  } catch (err) {
    Stumper.error(`Message content: ${message.content}  Error: ${err}`, "checkForNormalTextCommand");
  }
  return false;
}

function checkForCustomTextCommand(message: Message): boolean {
  const prefix = Config.getConfig().prefixes.normal;
  if (message.author.bot) return false;
  if (!message.channel.isTextBased()) return false;
  if (!message.content.startsWith(prefix)) return false;

  const messageArray = message.content.split(" ");
  const command = messageArray[0];

  const db = CustomCommandsDB.getInstance();
  const customCommand = db.getCommand(command);
  if (customCommand) {
    Stumper.info(`Executing custom command ${customCommand.name}.`, "checkForCustomTextCommand");
    message.channel.send(customCommand.text);
    return true;
  } else {
    Stumper.warning(`Custom Command ${command} not found!`, "checkForCustomTextCommand");
  }
  return false;
}
