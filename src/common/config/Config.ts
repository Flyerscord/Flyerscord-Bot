import fs from "fs";

import localConfig from "./local.config";
import defaultConfig from "./defaults.config";
import { IConfig } from "./IConfig";
import Stumper from "stumper";
import { IDefaultConfig } from "../interfaces/IDefaultConfig";

export default class Config {
  private static config: IConfig;

  static loadConfig(): void {
    const fileExists = this.fileExists();

    if (!fileExists) {
      Stumper.error("Config file not found", "common:Config:checkConfig");
      process.exit(1);
    }

    const config = this.mergeLocalAndDefaults();
    const emptyFields = this.getEmptyFields(config);

    if (emptyFields.length > 0) {
      const errorMessage = `The following fields are empty: ${emptyFields.join(", ")}`;
      Stumper.error(errorMessage, "common:Config:checkConfig");
      process.exit(1);
    }

    this.config = config as IConfig;
  }

  private static mergeLocalAndDefaults(): IDefaultConfig {
    // TODO: Implement this
    return {};
  }

  private static fileExists(): boolean {
    return fs.existsSync(`${__dirname}/configFile.js`);
  }

  private static getEmptyFields(obj: IDefaultConfig, prefix = ""): string[] {
    let emptyFields: string[] = [];

    for (const key in obj) {
      const fullKey = prefix ? `${prefix}.${key}` : key;

      if (obj[key] === "") {
        emptyFields.push(fullKey);
      } else if (typeof obj[key] === "object" && obj[key] !== null) {
        emptyFields = emptyFields.concat(this.getEmptyFields(obj[key], fullKey));
      }
    }

    return emptyFields;
  }

  static getConfig(): IConfig {
    return this.config;
  }

  static isProductionMode(): boolean {
    return this.config.productionMode;
  }
}
