import { Message } from "discord.js";

import TextCommand from "../../models/TextCommand";
import Logger from "Stumper";

export default class PrintMee6CmdsCommand extends TextCommand {
  constructor() {
    super("mee6cmds", "mee6cmds", "Convert the copied list of commands from the Mee6 website to an embed", {
      allowedPermissions: ["Administrator"],
    });
  }

  async execute(message: Message, args: Array<string>): Promise<void> {
    if (this.checkPermissions(message)) {
      message.delete();
      if (message.attachments.size > 0) {
        const file = message.attachments.first()!.url;

        try {
          const response = await fetch(file);

          // if there was an error send a message with the status
          if (!response.ok) {
            Logger.error(`There was an error with fetching the file: ${response.statusText}`, "PrintMee6CmdsCommand");
            return;
          }

          // take the response stream and read it to completion
          const text = await response.text();

          if (text) {
            parseAndSendMessage(message, text, true);
          } else {
            return;
          }
        } catch (error) {
          console.log(error);
        }
      } else if (args.length > 0) {
        parseAndSendMessage(message, args, false);
      } else {
        return;
      }
    }
  }
}

function parseAndSendMessage(message: Message, input: any, isFile: boolean) {
  let all;
  if (isFile) {
    all = input;
  } else {
    all = input.join("");
  }

  const descriptionRegex = /^[A-Za-z0-9].+$/gm;
  all = all.replace(descriptionRegex, "");

  let emptyLineRegex;
  if (isFile) {
    emptyLineRegex = /^[\r\n]+/gm;
  } else {
    emptyLineRegex = /^\n/gm;
  }
  all = all.replace(emptyLineRegex, "");

  let lines;
  if (isFile) {
    lines = all.split("\r").length;
  } else {
    lines = all.split("\n").length;
  }

  const now = new Date();
  const mm = now.getMonth() + 1;
  const dd = now.getDate();
  const yy = now.getFullYear().toString().slice(-2);

  const header = `**Mee6 Commands as of ${mm}/${dd}/${yy} (${lines - 1} commands)**`;
  message.channel.send(`${header}\n${all}`);
}
