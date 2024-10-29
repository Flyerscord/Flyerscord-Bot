import { Message } from "discord.js";

import ClientManager from "../../../common/managers/ClientManager.js";
import { addMessage } from "../utils/leveling.js";

export default (): void => {
  ClientManager.getInstance().client.on("messageCreate", async (message: Message) => {
    if (message.author.bot) return;
    if (!message.channel.isTextBased()) return;

    addMessage(message);
  });
};
