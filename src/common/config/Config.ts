import fs from "fs";

import config from "./configFile";
import { IConfig } from "./IConfig";

export default class Config {
  static fileExists(): boolean {
    return fs.existsSync(`${__dirname}/configFile.js`);
  }

  static getConfig(): IConfig {
    if (config.productionMode) {
      return config.production;
    }
    return config.nonProduction;
  }

  static isProductionMode(): boolean {
    return config.productionMode;
  }
}
