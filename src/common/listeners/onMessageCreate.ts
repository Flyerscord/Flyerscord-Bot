import { Client, Message } from "discord.js";

import TextCommand from "../models/TextCommand";
import Stumper from "stumper";
import ConfigManager from "@common/managers/ConfigManager";
import Env from "../utils/Env";
import MyAuditLog from "../utils/MyAuditLog";

export default (client: Client): void => {
  client.on("messageCreate", async (message: Message) => {
    if (await checkForNormalTextCommand(message)) return;
  });
};

async function checkForNormalTextCommand(message: Message): Promise<boolean> {
  if (message.author.bot) return false;
  if (!message.channel.isTextBased()) return false;
  const configManager = ConfigManager.getInstance();
  let prefix: string;
  try {
    prefix = configManager.getConfig("CustomCommands")?.prefix ?? "!";
  } catch (error) {
    if (Env.getBoolean("PRODUCTION_MODE")) {
      Stumper.caughtError(error, "onMessageCreate:checkForNormalTextCommand");
    } else {
      Stumper.warning("Custom Commands config not loaded! This is normal in development mode.", "onMessageCreate:checkForNormalTextCommand");
    }
    prefix = "!";
  }
  const adminPrefix = configManager.getConfig("Common").adminPrefix;
  if (!message.content.startsWith(prefix) && !message.content.startsWith(adminPrefix)) return false;

  const messageArray = message.content.split(" ");
  let command = messageArray[0];
  const args = messageArray.slice(1);

  const textCmd: TextCommand = message.client.textCommands.get(command);
  try {
    if (textCmd) {
      void MyAuditLog.createAuditLog("Common", {
        action: "NormalTextCommandRan",
        userId: message.author.id,
        details: {
          command: command,
          channelId: message.channelId,
          messageId: message.id,
          args: args,
        },
      });

      Stumper.info(`Command ${command} called by user ${message.author.username}!`, "common:onMessageCreate:checkForNormalTextCommand");
      await textCmd.run(message, args);
      return true;
    } else {
      Stumper.debug(`Command ${command} not found!`, "common:onMessageCreate:checkForNormalTextCommand");
    }
  } catch (err) {
    Stumper.error(
      `Error parsing normal text command message. Message content: ${message.content}`,
      "common:onMessageCreate:checkForNormalTextCommand",
    );
    Stumper.caughtError(err, "common:onMessageCreate:checkForNormalTextCommand");
  }
  return false;
}
