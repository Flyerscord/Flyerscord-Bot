import fs from "fs";

import * as config from "./config.json";
import { IConfig } from "./IConfig";

export default class Config {
  static fileExists(): boolean {
    return fs.existsSync(`${__dirname}/config.json`);
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
