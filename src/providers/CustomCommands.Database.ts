import ICustomCommand from "../interfaces/CustomCommand";
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
      };
      this.db.set(name, customCommand);
      return true;
    }
    return false;
  }

  updateCommand(name: string, text: string): boolean {
    if (this.hasCommand(name)) {
      this.db.update(name, { text: text });
      return true;
    }
    return false;
  }

  getAllCommands(): Array<ICustomCommand> {
    return this.getAllValues();
  }
}
