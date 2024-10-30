import { Client, REST, RESTPostAPIChatInputApplicationCommandsJSONBody, RESTPostAPIContextMenuApplicationCommandsJSONBody, Routes } from "discord.js";
import Config from "../../../common/config/Config";
import Stumper from "stumper";
import ClientManager from "../../../common/managers/ClientManager";
import SlashCommandManager from "../../../common/managers/SlashCommandManager";
import ContextMenuCommandManager from "../../../common/managers/ContextMenuManager";
import Time from "../../../common/utils/Time";

export async function readAndRegisterCommands(): Promise<void> {
  const client = ClientManager.getInstance().client;
  const slashCommands = await readSlashCommands(client);
  const contextMenus = await readContextMenus(client);

  const commands = [...slashCommands, ...contextMenus];
  Stumper.info(`Registering ${commands.length} commands...`, "readAndRegisterCommands");
  await registerAllCommands(client, commands);
}

async function registerAllCommands(
  client: Client,
  commands: (RESTPostAPIChatInputApplicationCommandsJSONBody | RESTPostAPIContextMenuApplicationCommandsJSONBody)[],
): Promise<void> {
  const rest = new REST({ version: "10" }).setToken(Config.getConfig().token);

  if (!client.user) {
    Stumper.error("Client user not found", "registerAllCommands");
    throw new Error("Client user not found");
  }

  const isProduction = Config.isProductionMode();
  const target = isProduction ? "production" : "non-production";

  const guildId = Config.getConfig().guildId;
  if (!isProduction && !guildId) {
    Stumper.error("Guild id missing from non production config", "registerAllCommands");
    throw new Error("Guild id missing from non production config");
  }

  const route = isProduction ? Routes.applicationCommands(client.user.id) : Routes.applicationGuildCommands(client.user.id, guildId!);

  try {
    await withTimeout(rest.put(route, { body: commands }), 10 * 60 * 1000);
    Stumper.success(`Successfully registered commands for ${target}.`, "registerAllCommands");
  } catch (err) {
    Stumper.error(`Error registering commands for ${target}: ${err}`, "registerAllCommands");
    if (err instanceof Error && err.message.includes("Request timed out")) {
      // Do nothing
    } else {
      throw err;
    }
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

// eslint-disable-next-line @typescript-eslint/no-explicit-any
async function withTimeout(promise: Promise<any>, ms: number) {
  const timeout = new Promise((_, reject) =>
    setTimeout(() => reject(new Error(`Request timed out after ${Time.getFormattedTimeFromMilliseconds(ms)}`)), ms),
  );
  return Promise.race([promise, timeout]);
}
