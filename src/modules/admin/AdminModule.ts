import Module from "../../common/models/Module";
import SlashCommand from "../../common/models/SlashCommand";

export default class AdminModule extends Module<IAdminConfig> {
  private constructor(config: IAdminConfig) {
    super("Admin", config);
  }

  protected async setup(): Promise<void> {
    await this.readInCommands<SlashCommand>(__dirname, "slash");
  }

  protected async cleanup(): Promise<void> {
    // Nothing to cleanup
  }

  getDefaultConfig(): IAdminConfig {
    return {};
  }
}

export interface IAdminConfig {}
