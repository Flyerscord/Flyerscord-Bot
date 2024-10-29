import fs from "fs";

import { fileURLToPath } from 'url';
import { dirname } from 'path';

import * as config from "./config.json";
import { IConfig } from "./IConfig.js";

export default class Config {
  static fileExists(): boolean {
    const __dirname = dirname(fileURLToPath(import.meta.url));
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
