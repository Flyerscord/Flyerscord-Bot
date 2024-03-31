import { Client, REST, Routes, RESTPostAPIChatInputApplicationCommandsJSONBody } from "discord.js";
import fs from "fs";

import Config from "../config/Config";
import Stumper from "stumper";
import SlashCommand from "../models/SlashCommand";
import TextCommand from "../models/TextCommand";
import ModalMenu from "../models/Modal";
import { ContextMenuCommand } from "../models/ContextMenuCommand";

export default (client: Client): void => {
  client.on("ready", async () => {
    const slashCommands = await readSlashCommands(client);
    await readTextCommands(client);
    await readModals(client);
    await readContextMenus(client);

    Stumper.info("Bot Online!", "clientReady");
    Stumper.info("Registering guild slash commands", "clientReady");

    registerSlashCommands(client, slashCommands);
  });
};

function registerSlashCommands(client: Client, slashCommands: Array<RESTPostAPIChatInputApplicationCommandsJSONBody>): void {
  const rest = new REST({ version: "10" }).setToken(Config.getConfig().token);

  if (client.user) {
    // If the bot is in production mode register the commands globally (changes will take longer to appear)
    if (Config.isProductionMode()) {
      rest
        .put(Routes.applicationCommands(client.user.id), {
          body: slashCommands,
        })
        .then(() => Stumper.info("Successfully registered application commands for production.", "registerSlashCommands"))
        .catch((err) => {
          Stumper.error(`Error registering application commands for production: ${err}`, "registerSlashCommands");
        });
    } else {
      // If the bot is in non production mode register the commands to the testing guild (changes will appear immediately)
      const guildId = Config.getConfig().guildId;
      if (guildId) {
        rest
          .put(Routes.applicationGuildCommands(client.user.id, guildId), {
            body: slashCommands,
          })
          .then(() => Stumper.info("Successfully registered application commands for development guild.", "registerSlashCommands"))
          .catch((err) => {
            Stumper.error(`Error registering application commands for development guild: ${err}`, "registerSlashCommands");
          });
      } else {
        Stumper.error("Guild id missing from non production config", "registerSlashCommands");
      }
    }
  }
}

async function readSlashCommands(client: Client): Promise<Array<RESTPostAPIChatInputApplicationCommandsJSONBody>> {
  const commands: Array<RESTPostAPIChatInputApplicationCommandsJSONBody> = [];

  const slashCommandFiles = fs.readdirSync(`${__dirname}/../commands/slash`).filter((file) => file.endsWith(".js"));

  for (const file of slashCommandFiles) {
    Stumper.info(`Loading slash command: ${file}`, "readSlashCommands");
    const Command = await import(`../commands/slash/${file}`);
    const command: SlashCommand = new Command.default();
    commands.push(command.data.toJSON());
    client.slashCommands.set(command.name, command);
  }

  Stumper.info(`Successfully loaded ${commands.length} slash commands!`, "readSlashCommands");
  return commands;
}

async function readTextCommands(client: Client): Promise<void> {
  const textCommandFiles = fs.readdirSync(`${__dirname}/../commands/text`).filter((file) => file.endsWith(".js"));

  for (const file of textCommandFiles) {
    Stumper.info(`Loading text command: ${file}`, "readTextCommands");
    const Command = await import(`../commands/text/${file}`);
    const command: TextCommand = new Command.default();
    client.textCommands.set(command.command, command);
  }

  Stumper.info(`Successfully loaded ${client.textCommands.size} text commands!`, "readTextCommands");
}

async function readModals(client: Client): Promise<void> {
  const modalFiles = fs.readdirSync(`${__dirname}/../commands/modals`).filter((file) => file.endsWith(".js"));

  for (const file of modalFiles) {
    Stumper.info(`Loading modal: ${file}`, "readModals");
    const Modal = await import(`../commands/modals/${file}`);
    const modal: ModalMenu = new Modal.default();
    client.modals.set(modal.id, modal);
  }

  Stumper.info(`Successfully loaded ${client.modals.size} modals!`, "readModals");
}

async function readContextMenus(client: Client): Promise<void> {
  const contextMenuFiles = fs.readdirSync(`${__dirname}/../commands/contextMenus`).filter((file) => file.endsWith(".js"));

  for (const file of contextMenuFiles) {
    Stumper.info(`Loading context menu: ${file}`, "readContextMenus");
    const ContextMenu = await import(`../commands/contextMenus/${file}`);
    const contextMenu: ContextMenuCommand = new ContextMenu.default();
    client.contextMenus.set(contextMenu.name, contextMenu);
  }

  Stumper.info(`Successfully loaded ${client.contextMenus.size} context menus!`, "readContextMenus");
}
