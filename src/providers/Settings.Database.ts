import Database from "./Database";

// Create a singleton class that extends the Database class
export default class SettingsDB extends Database {
  private static instance: SettingsDB;

  private constructor() {
    super({ name: "Settings" });
  }

  static getInstance(): SettingsDB {
    return this.instance || (this.instance = new this());
  }

  // Add methods for this database below
  // Example:
  // setPrefix(guildId: string, prefix: string): boolean {
  //   if (this.db.has(guildId)) {
  //     this.db.set(guildId, prefix, "prefix");
  //     return true;
  //   }
  //   return false;
  // }
}
