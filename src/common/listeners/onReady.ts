import { Client, REST, Routes, RESTPostAPIChatInputApplicationCommandsJSONBody, RESTPostAPIContextMenuApplicationCommandsJSONBody } from "discord.js";

import Stumper from "stumper";
import Config from "../config/Config";
import SlashCommandManager from "../managers/SlashCommandManager";
import TextCommandManager from "../managers/TextCommandManager";
import ModalMenuManager from "../managers/ModalMenuManager";
import ContextMenuCommandManager from "../managers/ContextMenuManager";

export default (client: Client): void => {
  client.on("ready", async () => {
    const slashCommands = await readSlashCommands(client);
    await readTextCommands(client);
    await readModals(client);
    const contextMenus = await readContextMenus(client);

    const commands = [...slashCommands, ...contextMenus];
    Stumper.info("Registering commands", "clientReady");
    await registerAllCommands(client, commands);

    Stumper.info("Bot Online!", "clientReady");
  });
};

async function registerAllCommands(
  client: Client,
  commands: (RESTPostAPIChatInputApplicationCommandsJSONBody | RESTPostAPIContextMenuApplicationCommandsJSONBody)[],
): Promise<void> {
  const rest = new REST().setToken(Config.getConfig().token);

  if (!client.user) {
    Stumper.error("Client user not found", "registerCommands");
    throw new Error("Client user not found");
  }

  const isProduction = Config.isProductionMode();
  const target = isProduction ? "production" : "non-production";

  const guildId = Config.getConfig().guildId;
  if (!isProduction && !guildId) {
    Stumper.error("Guild id missing from non production config", "registerCommands");
    throw new Error("Guild id missing from non production config");
  }

  const route = isProduction ? Routes.applicationCommands(client.user.id) : Routes.applicationGuildCommands(client.user.id, guildId!);

  try {
    await rest.put(route, { body: commands });
    Stumper.success(`Successfully registered commands for ${target}.`, "registerCommands");
  } catch (err) {
    Stumper.error(`Error registering commands for ${target}: ${err}`, "registerCommands");
    throw err;
  }
}

async function readSlashCommands(client: Client): Promise<Array<RESTPostAPIChatInputApplicationCommandsJSONBody>> {
  const commands: Array<RESTPostAPIChatInputApplicationCommandsJSONBody> = [];

  const slashCommands = SlashCommandManager.getInstance().getCommands();
  slashCommands.forEach((command) => {
    commands.push(command.data.toJSON());
    client.slashCommands.set(command.name, command);
  });

  Stumper.success(`Successfully loaded ${slashCommands.size} slash commands!`, "readSlashCommands");
  return commands;
}

async function readTextCommands(client: Client): Promise<void> {
  const textCommands = TextCommandManager.getInstance().getCommands();
  textCommands.forEach((command) => {
    client.textCommands.set(command.command, command);
  });

  Stumper.success(`Successfully loaded ${textCommands.size} text commands!`, "readTextCommands");
}

async function readModals(client: Client): Promise<void> {
  const modalMenus = ModalMenuManager.getInstance().getCommands();
  modalMenus.forEach((command) => {
    client.modals.set(command.id, command);
  });

  Stumper.success(`Successfully loaded ${client.modals.size} modals!`, "readModals");
}

async function readContextMenus(client: Client): Promise<Array<RESTPostAPIContextMenuApplicationCommandsJSONBody>> {
  const menus: Array<RESTPostAPIContextMenuApplicationCommandsJSONBody> = [];

  const contextMenus = ContextMenuCommandManager.getInstance().getCommands();
  contextMenus.forEach((menu) => {
    client.contextMenus.set(menu.name, menu);
    menus.push(menu.data.toJSON());
  });

  Stumper.success(`Successfully loaded ${client.contextMenus.size} context menus!`, "readContextMenus");
  return menus;
}
