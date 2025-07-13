import { Collection } from "discord.js";
import ModalMenu from "../models/ModalMenu";
import Stumper from "stumper";
import { Singleton } from "../models/Singleton";

export default class ModalMenuManager extends Singleton {
  private commands: Collection<string, ModalMenu>;

  constructor() {
    super();
    this.commands = new Collection();
  }

  addCommands(commands: ModalMenu[]): void {
    commands.forEach((command) => this.addCommand(command));
  }

  addCommand(command: ModalMenu): void {
    if (this.hasCommand(command)) {
      Stumper.warning(`ModalMenu ${command.name} already exists`, "common:ModalMenuManager:addCommand");
      return;
    }
    this.commands.set(command.name, command);
  }

  getCommands(): Collection<string, ModalMenu> {
    return this.commands;
  }

  hasCommand(command: ModalMenu): boolean {
    return this.commands.has(command.name);
  }
}
