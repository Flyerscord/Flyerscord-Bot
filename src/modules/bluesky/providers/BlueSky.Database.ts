import Stumper from "stumper";
import Database from "../../../common/providers/Database";
import { AccountAlreadyExistsException } from "../exceptions/AccountAlreadyExistsException";
import { IBlueSkyAccount } from "../interfaces/IBlueSkyAccount";
import { AccountDoesNotExistException } from "../exceptions/AccountDoesNotExistException";

export default class BlueSkyDB extends Database {
  private static instance: BlueSkyDB;

  constructor() {
    super({ name: "blue-sky" });
  }

  static getInstance(): BlueSkyDB {
    return this.instance || (this.instance = new this());
  }

  getAllAccounts(): string[] {
    return this.getAllKeys() as string[];
  }

  hasAccount(account: string): boolean {
    return this.db.has(account);
  }

  getAccount(account: string): IBlueSkyAccount {
    if (!this.hasAccount(account)) {
      Stumper.error(`Error getting account: ${account}`, "blueSky:BlueSkyDB:getAccount");
      throw new AccountDoesNotExistException();
    }
    return this.db.get(account);
  }

  addAccount(account: string, addedBy: string): void {
    if (this.hasAccount(account)) {
      Stumper.error(`Error adding account: ${account}`, "blueSky:BlueSkyDB:addAccount");
      throw new AccountAlreadyExistsException();
    }

    const accountObj: IBlueSkyAccount = {
      account: account,
      addedOn: new Date(),
      addedBy: addedBy,
      lastPostId: "",
    };

    Stumper.debug(`Adding account: ${account}  By user: ${addedBy}`, "blueSky:BlueSkyDB:addAccount");
    this.db.set(account, accountObj);
  }

  removeAccount(account: string): void {
    if (!this.hasAccount(account)) {
      Stumper.error(`Error removing account: ${account}`, "blueSky:BlueSkyDB:removeAccount");
      throw new AccountDoesNotExistException();
    }

    Stumper.debug(`Removing account: ${account}`, "blueSky:BlueSkyDB:removeAccount");
    this.db.delete(account);
  }
}
