import { Collection } from "discord.js";
import ModalMenu from "../models/ModalMenu";
import Stumper from "stumper";

export default class ModalMenuManager {
  private static instance: ModalMenuManager;

  private commands: Collection<string, ModalMenu>;

  private constructor() {
    this.commands = new Collection();
  }

  static getInstance(): ModalMenuManager {
    if (!ModalMenuManager.instance) {
      ModalMenuManager.instance = new ModalMenuManager();
    }
    return ModalMenuManager.instance;
  }

  addCommands(commands: Array<ModalMenu>): void {
    commands.forEach((command) => this.addCommand(command));
  }

  addCommand(command: ModalMenu): void {
    if (this.hasCommand(command)) {
      Stumper.warning(`ModalMenu ${command.id} already exists`);
      return;
    }
    this.commands.set(command.id, command);
  }

  getCommands(): Collection<string, ModalMenu> {
    return this.commands;
  }

  hasCommand(command: ModalMenu): boolean {
    return this.commands.has(command.id);
  }
}
