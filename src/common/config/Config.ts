import fs from "fs";

import localConfig from "./local.config";
import defaultConfig from "./defaults.config";
import Stumper from "stumper";
import { IKeyedObject } from "../interfaces/IKeyedObject";

export default class Config {
  private static config: IKeyedObject;

  static loadConfig(): IKeyedObject {
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

    this.config = config as IKeyedObject;
    return this.config;
  }

  private static mergeLocalAndDefaults(): IKeyedObject {
    return Object.assign({}, defaultConfig, localConfig);
  }

  private static fileExists(): boolean {
    return fs.existsSync(`${__dirname}/configFile.js`);
  }

  private static getEmptyFields(obj: IKeyedObject, prefix = ""): string[] {
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
}
