import { Message } from "discord.js";
import Stumper from "stumper";

import ClientManager from '../../../common/managers/ClientManager';

export default (): void => {
    ClientManager.getInstance().client.on("messageCreate", async (message: Message) => {
        if (message.author.bot) return;
        if (!message.channel.isTextBased()) return;

        // TODO: Add logic for adding exp to the user
    });
};