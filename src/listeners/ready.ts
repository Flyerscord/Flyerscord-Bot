import { Client, RESTPostAPIChatInputApplicationCommandsJSONBody, Routes, TextChannel } from "discord.js";
import { REST } from "@discordjs/rest";

import Config from "../config/Config";
import Logger from "../util/Logger";
import { SlashCommand } from "../models/SlashCommand";
import VistorRoleDB from "../providers/VistorRole.Database";
import discord from "../util/discord/discord";
import TextCommand from "../models/TextCommand";
import Files from "../util/Files";

export default (client: Client): void => {
  client.on("ready", async () => {
    Logger.info("Bot Online!", "clientReady");
    await registerListenerEvents(client);
    await registerSlashCommands(client);
    await readTextCommands(client);
    // setupVistorMessage(client);
    Logger.info("Bot Initialization Complete!", "clientReady");
  });
};

// TODO: Test
async function registerListenerEvents(client: Client): Promise<void> {
  const eventFiles = Files.getAllJsFilesRecursive(`${__dirname}/../listeners`, ["ready.js", "errorHandling.js"]);

  for (const listener of eventFiles) {
    Logger.info(`Loading listener: ${listener.fileName}`, "registerListenerEvents");
    Logger.debug(`Listener file: ${listener.toString()}`, "registerListenerEvents");
    const listenerEventImport = await import(listener.path);
    const listenerEvent = listenerEventImport.default();
    listenerEvent(client);
  }
}

async function registerSlashCommands(client: Client): Promise<void> {
  const slashCommands: Array<RESTPostAPIChatInputApplicationCommandsJSONBody> = [];

  const commandFiles = Files.getAllJsFilesRecursive(`${__dirname}/../commands/slash`);

  for (const file of commandFiles) {
    Logger.info(`Loading slash command: ${file.fileName}`, "registerSlashCommands");
    Logger.debug(`Slash command file: ${file.toString()}`, "registerSlashCommands");
    const Command = await import(file.path);
    const command: SlashCommand = new Command.default();
    slashCommands.push(command.data.toJSON());
    client.slashCommands.set(command.name, command);
  }

  Logger.info(`Successfully loaded ${slashCommands.length} slash commands!`, "registerSlashCommands");

  const rest = new REST({ version: "9" }).setToken(Config.getConfig().token);
  Logger.info("Registering Slash Commands", "registerSlashCommands");

  if (client.user) {
    // If the bot is in production mode register the commands globally (changes will take longer to appear)
    if (Config.isProductionMode()) {
      rest
        .put(Routes.applicationCommands(client.user.id), {
          body: slashCommands,
        })
        .then(() =>
          Logger.info("Successfully registered application commands for development guild.", "registerSlashCommands")
        )
        .catch((err) => {
          Logger.error(`Error registering application commands for development guild: ${err}`, "registerSlashCommands");
        });
    } else {
      // If the bot is in non production mode register the commands to the testing guild (changes will appear immediately)
      const guildId = Config.getConfig().guildId;
      if (guildId) {
        rest
          .put(Routes.applicationGuildCommands(client.user.id, guildId), {
            body: slashCommands,
          })
          .then(() =>
            Logger.info("Successfully registered application commands for production.", "registerSlashCommands")
          )
          .catch((err) => {
            Logger.error(`Error registering application commands for production: ${err}`, "registerSlashCommands");
          });
      } else {
        Logger.error("Guild id missing from non production config", "registerSlashCommands");
      }
    }
  }
}

async function readTextCommands(client: Client): Promise<void> {
  const commandFiles = Files.getAllJsFilesRecursive(`${__dirname}/../commands/text`);

  for (const file of commandFiles) {
    Logger.info(`Loading text command: ${file}`, "readTextCommands");
    Logger.debug(`Text command file: ${file.toString()}`, "readTextCommands");
    const Command = await import(file.path);
    const command: TextCommand = new Command.default();
    client.textCommands.set(command.command, command);
  }

  Logger.info(`Successfully loaded ${client.textCommands.length} text commands!`, "readTextCommands");
}

async function setupVistorMessage(client: Client): Promise<void> {
  const db = VistorRoleDB.getInstance();
  const roleChannelId = Config.getConfig().vistorReactRole.rolesChannelId;
  const visitorEmoji = Config.getConfig().vistorReactRole.visitorEmoji;

  const messageId = db.getMessageId();
  if (messageId) {
    const channel = client.channels.cache.get(roleChannelId) as TextChannel;
    if (channel) {
      const message = await channel.messages.fetch(messageId);

      if (!message) {
        const embed = discord.embeds.getVistorRoleReactEmbed();
        const newMessage = await discord.messages.sendEmbedToChannel(client, roleChannelId, embed);
        if (newMessage) {
          db.setMessageId(newMessage.id);
          discord.reactions.reactToMessageWithEmoji(newMessage, visitorEmoji);
        }
      }
    }
  }
}
