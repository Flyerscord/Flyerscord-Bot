import { Collection } from "discord.js";
import ButtonHandler from "../models/ButtonHandler";
import Stumper from "stumper";
import { Singleton } from "../models/Singleton";

/**
 * Singleton registry of all loaded `ButtonHandler`s, keyed by name, mirroring `ModalMenuManager`.
 */
export default class ButtonHandlerManager extends Singleton {
  private commands: Collection<string, ButtonHandler>;

  constructor() {
    super();
    this.commands = new Collection();
  }

  /**
   * Registers multiple button handlers.
   */
  addCommands(commands: ButtonHandler[]): void {
    commands.forEach((command) => this.addCommand(command));
  }

  /**
   * Registers a button handler. Logs a warning and skips registration if the name is already taken.
   */
  addCommand(command: ButtonHandler): void {
    if (this.hasCommand(command)) {
      Stumper.warning(`ButtonHandler ${command.name} already exists`, "common:ButtonHandlerManager:addCommand");
      return;
    }
    this.commands.set(command.name, command);
  }

  getCommands(): Collection<string, ButtonHandler> {
    return this.commands;
  }

  /**
   * Checks whether a button handler with the same name is already registered.
   */
  hasCommand(command: ButtonHandler): boolean {
    return this.commands.has(command.name);
  }
}
