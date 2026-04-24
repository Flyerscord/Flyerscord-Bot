import { ActivityType, Client, RESTPostAPIChatInputApplicationCommandsJSONBody, RESTPostAPIContextMenuApplicationCommandsJSONBody } from "discord.js";

import Stumper from "stumper";
import TextCommandManager from "../managers/TextCommandManager";
import ModalMenuManager from "../managers/ModalMenuManager";
import BotHealthManager from "../managers/BotHealthManager";
import ContextMenuCommandManager from "../managers/ContextMenuManager";
import SlashCommandManager from "../managers/SlashCommandManager";
import fs from "node:fs";
import EnvManager from "../managers/EnvManager";
import MembersCache from "../cache/MembersCache";

export default (client: Client): void => {
  client.on("clientReady", async () => {
    await readSlashCommands(client);
    await readContextMenus(client);
    readTextCommands(client);
    readModals(client);

    await setupBot(client);

    await updateAndRegisterCaches();

    const healthManager = BotHealthManager.getInstance();
    healthManager.setHealthy(true);
    Stumper.info("Bot Online!", "common:onReady:clientReady");
  });
};

async function updateAndRegisterCaches(): Promise<void> {
  const membersCache = MembersCache.getInstance();
  await membersCache.forceUpdate();
  membersCache.createScheduledJob();
}

async function setupBot(client: Client): Promise<void> {
  if (EnvManager.getInstance().get("PRODUCTION_MODE")) {
    Stumper.info("Setting bot presence", "common:onReady:setupBot");
    client.user?.setPresence({ status: "online", activities: [{ name: "Flyers Hockey", type: ActivityType.Watching }] });

    Stumper.info("Setting bot avatar", "common:onReady:setupBot");
    const avatar = fs.readFileSync(`${__dirname}/../assets/botAvatar.png`);
    await client.user?.setAvatar(avatar);

    Stumper.info("Setting bot banner", "common:onReady:setupBot");
    const banner = fs.readFileSync(`${__dirname}/../assets/botBanner.png`);
    await client.user?.setBanner(banner);

    Stumper.info("Setting bot username", "common:onReady:setupBot");
    await client.user?.setUsername("Gritty");
  }
}

function readTextCommands(client: Client): void {
  const textCommands = TextCommandManager.getInstance().getCommands();
  textCommands.forEach((command) => {
    client.textCommands.set(`${command.prefix}${command.command}`, command);
  });

  Stumper.success(`Successfully loaded ${textCommands.size} text commands!`, "common:onReady:readTextCommands");
}

function readModals(client: Client): void {
  const modalMenus = ModalMenuManager.getInstance().getCommands();
  modalMenus.forEach((command) => {
    client.modals.set(command.name, command);
  });

  Stumper.success(`Successfully loaded ${client.modals.size} modals!`, "common:onReady:readModals");
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
  Stumper.success(`Successfully loaded ${slashCommands.size} slash commands!`, "common:onReady:readSlashCommands");
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
  Stumper.success(`Successfully loaded ${client.contextMenus.size} context menus!`, "common:onReady:readContextMenus");
}
