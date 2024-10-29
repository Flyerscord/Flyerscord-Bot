import { Client, REST, Routes, RESTPostAPIChatInputApplicationCommandsJSONBody } from "discord.js";

import Stumper from "stumper";
import Config from "../config/Config.ts";
import SlashCommandManager from "../managers/SlashCommandManager.ts";
import TextCommandManager from "../managers/TextCommandManager.ts";
import ModalMenuManager from "../managers/ModalMenuManager.ts";
import ContextMenuCommandManager from "../managers/ContextMenuManager.ts";

export default (client: Client): void => {
  client.on("ready", async () => {
    const slashCommands = readSlashCommands(client);
    readTextCommands(client);
    readModals(client);
    readContextMenus(client);

    Stumper.info("Registering guild slash commands", "clientReady");
    registerSlashCommands(client, slashCommands);
    Stumper.info("Bot Online!", "clientReady");
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

function readSlashCommands(client: Client): Array<RESTPostAPIChatInputApplicationCommandsJSONBody> {
  const commands: Array<RESTPostAPIChatInputApplicationCommandsJSONBody> = [];

  const slashCommands = SlashCommandManager.getInstance().getCommands();
  slashCommands.forEach((command) => {
    commands.push(command.data.toJSON());
    client.slashCommands.set(command.name, command);
  });

  Stumper.info(`Successfully loaded ${slashCommands.size} slash commands!`, "readSlashCommands");
  return commands;
}

function readTextCommands(client: Client): void {
  const textCommands = TextCommandManager.getInstance().getCommands();
  textCommands.forEach((command) => {
    client.textCommands.set(command.command, command);
  });

  Stumper.info(`Successfully loaded ${textCommands.size} text commands!`, "readTextCommands");
}

function readModals(client: Client): void {
  const modalMenus = ModalMenuManager.getInstance().getCommands();
  modalMenus.forEach((command) => {
    client.modals.set(command.id, command);
  });

  Stumper.info(`Successfully loaded ${client.modals.size} modals!`, "readModals");
}

function readContextMenus(client: Client): void {
  const contextMenus = ContextMenuCommandManager.getInstance().getCommands();
  contextMenus.forEach((command) => {
    client.contextMenus.set(command.name, command);
  });

  Stumper.info(`Successfully loaded ${client.contextMenus.size} context menus!`, "readContextMenus");
}
