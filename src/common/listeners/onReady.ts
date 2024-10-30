import { Client, RESTPostAPIChatInputApplicationCommandsJSONBody, RESTPostAPIContextMenuApplicationCommandsJSONBody } from "discord.js";

import Stumper from "stumper";
import TextCommandManager from "../managers/TextCommandManager";
import ModalMenuManager from "../managers/ModalMenuManager";
import BotHealthManager from "../managers/BotHealthManager";
import ContextMenuCommandManager from "../managers/ContextMenuManager";
import SlashCommandManager from "../managers/SlashCommandManager";

export default (client: Client): void => {
  client.on("ready", async () => {
    await readSlashCommands(client);
    await readContextMenus(client);
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

async function readSlashCommands(client: Client): Promise<void> {
  const commands: RESTPostAPIChatInputApplicationCommandsJSONBody[] = [];

  const slashCommandManager = SlashCommandManager.getInstance();
  const slashCommands = slashCommandManager.getCommands();
  slashCommands.forEach((command) => {
    commands.push(command.data.toJSON());
    client.slashCommands.set(command.name, command);
  });

  slashCommandManager.setRegistrationInfo(commands);
  Stumper.success(`Successfully loaded ${slashCommands.size} slash commands!`, "readSlashCommands");
}

async function readContextMenus(client: Client): Promise<void> {
  const menus: RESTPostAPIContextMenuApplicationCommandsJSONBody[] = [];

  const contextMenuManager = ContextMenuCommandManager.getInstance();
  const contextMenus = contextMenuManager.getCommands();
  contextMenus.forEach((menu) => {
    client.contextMenus.set(menu.name, menu);
    menus.push(menu.data.toJSON());
  });

  contextMenuManager.setRegistrationInfo(menus);
  Stumper.success(`Successfully loaded ${client.contextMenus.size} context menus!`, "readContextMenus");
}
