import { IKeyedObject } from "./interfaces/IKeyedObject";
import Module from "./models/Module";
import GlobalDB from "./providers/Global.Database";

export default class CommonModule extends Module<ICommonConfig> {
  constructor(config: IKeyedObject) {
    super("Common", config);
  }

  protected async setup(): Promise<void> {
    // Do nothing
  }

  protected async cleanup(): Promise<void> {
    await GlobalDB.getInstance().close();
  }

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
