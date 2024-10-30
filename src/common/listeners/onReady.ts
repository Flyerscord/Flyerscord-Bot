import { Client } from "discord.js";

import Stumper from "stumper";
import TextCommandManager from "../managers/TextCommandManager";
import ModalMenuManager from "../managers/ModalMenuManager";
import BotHealthManager from "../managers/BotHealthManager";

export default (client: Client): void => {
  client.on("ready", async () => {
    readTextCommands(client);
    readModals(client);

    const healthManager = BotHealthManager.getInstance();
    healthManager.setHealthy(true);
    Stumper.info("Bot Online!", "clientReady");
  });
};

function readTextCommands(client: Client): void {
  const textCommands = TextCommandManager.getInstance().getCommands();
  textCommands.forEach((command) => {
    client.textCommands.set(`${command.prefix}${command.command}`, command);
    Stumper.debug(`Read in text command: ${command.prefix}${command.name}`, "readTextCommands");
  });

  Stumper.success(`Successfully loaded ${textCommands.size} text commands!`, "readTextCommands");
}

function readModals(client: Client): void {
  const modalMenus = ModalMenuManager.getInstance().getCommands();
  modalMenus.forEach((command) => {
    client.modals.set(command.id, command);
  });

  Stumper.success(`Successfully loaded ${client.modals.size} modals!`, "readModals");
}
