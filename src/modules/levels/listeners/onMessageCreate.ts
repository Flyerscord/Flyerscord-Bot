import { Message } from "discord.js";

import ClientManager from "@common/managers/ClientManager";
import { addMessage } from "../utils/leveling";
import ConfigManager from "@root/src/common/managers/ConfigManager";

export default (): void => {
  ClientManager.getInstance().client.on("messageCreate", async (message: Message) => {
    if (message.author.bot) return;
    if (!message.channel.isTextBased()) return;
    if (message.channel.isDMBased()) return;
    if (message.guild?.id != ConfigManager.getInstance().getConfig("Common").masterGuildId) return;

    await addMessage(message);
  });
};
