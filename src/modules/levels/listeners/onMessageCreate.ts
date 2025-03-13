import { Message } from "discord.js";

import ClientManager from "../../../common/managers/ClientManager";
import { addMessage } from "../utils/leveling";
import CommonModule from "../../../common/CommonModule";

export default (): void => {
  ClientManager.getInstance().client.on("messageCreate", async (message: Message) => {
    if (message.author.bot) return;
    if (!message.channel.isTextBased()) return;
    if (message.channel.isDMBased()) return;
    if (message.guild?.id != CommonModule.getInstance().config.masterGuildId) return;

    addMessage(message);
  });
};
