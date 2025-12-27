import schema from "./db/schema";
import { IKeyedObject } from "./interfaces/IKeyedObject";
import Module from "./models/Module";

export default class CommonModule extends Module<ICommonConfig> {
  constructor(config: IKeyedObject) {
    super("Common", config, schema);
  }

  protected async setup(): Promise<void> {
    // Do nothing
  }

  protected async cleanup(): Promise<void> {}

  protected getDefaultConfig(): ICommonConfig {
    return {
      productionMode: false,
      token: "",
      logLevel: 3,
      masterGuildId: "",
      adminPrefix: ".",
      advancedDebug: false,
    };
  }
}

export interface ICommonConfig {
  productionMode: boolean;
  token: string;
  logLevel: number;
  masterGuildId: string;
  adminPrefix: string;
  advancedDebug: boolean;
}
