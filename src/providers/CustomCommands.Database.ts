import ICustomCommand, { ICustomCommandHistory } from "../interfaces/CustomCommand";
import Time from "../util/Time";
import Database from "./Database";

export default class CustomCommandsDB extends Database {
  private static instance: CustomCommandsDB;

  private constructor() {
    super({ name: "custom-commands" });
  }

  static getInstance(): CustomCommandsDB {
    return this.instance || (this.instance = new this());
  }

  hasCommand(name: string): boolean {
    return this.db.has(name);
  }

  getCommand(name: string): ICustomCommand | undefined {
    if (!this.hasCommand(name)) {
      return undefined;
    }
    return this.db.get(name);
  }

  addCommand(name: string, text: string, userId: string): boolean {
    if (!this.hasCommand(name)) {
      const customCommand: ICustomCommand = {
        name: name,
        text: text,
        createdBy: userId,
        createdOn: Time.getCurrentTime(),
        history: [],
      };
      this.db.set(name, customCommand);
      return true;
    }
    return false;
  }

  removeCommand(name: string): boolean {
    if (!this.hasCommand(name)) {
      return false;
    }
    this.db.delete(name);
    return true;
  }

  updateCommand(name: string, text: string, userId: string): boolean {
    if (this.hasCommand(name)) {
      const oldCommand = this.getCommand(name)!;
      const newCommand = this.updateObject(oldCommand, text, userId);
      this.db.set(name, newCommand);
      return true;
    }
    return false;
  }

  getAllCommands(): Array<ICustomCommand> {
    return this.getAllValues();
  }

  private updateObject(oldCommand: ICustomCommand, newText: string, editUser: string): ICustomCommand {
    const newCommand = oldCommand;

    const historyEntry: ICustomCommandHistory = {
      oldText: oldCommand.text,
      newText: newText,
      editedBy: editUser,
      editedOn: Time.getCurrentTime(),
    };

    newCommand.text = newText;
    newCommand.history.push(historyEntry);
    return newCommand;
  }
}
