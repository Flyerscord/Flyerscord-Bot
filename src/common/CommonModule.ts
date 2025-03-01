import { IDefaultConfig } from "./interfaces/IDefaultConfig";
import Module from "./models/Module";
import GlobalDB from "./providers/Global.Database";

export default class CommonModule extends Module {
  constructor() {
    super("Common");
  }

  protected async setup(): Promise<void> {
    // Do nothing
  }

  protected async cleanup(): Promise<void> {
    GlobalDB.getInstance().close();
  }

  protected getDefaultConfig(): IDefaultConfig {
    return {
      productionMode: false,
      token: "",
      logLevel: 3,
      masterGuildId: "",
    };
  }
}
