import { IKeyedObject } from "@common/interfaces/IKeyedObject";
import Module from "@common/models/Module";
import SlashCommand from "@common/models/SlashCommand";
import onMessageCreate from "./listeners/onMessageCreate";

export default class AdminModule extends Module<IAdminConfig> {
  constructor(config: IKeyedObject) {
    super("Admin", config);
  }

  protected async setup(): Promise<void> {
    await this.readInCommands<SlashCommand>(__dirname, "slash");

    this.registerListeners();
  }

  protected async cleanup(): Promise<void> {
    // Nothing to cleanup
  }

  getDefaultConfig(): IAdminConfig {
    return {
      ub3rBot: {
        userId: "",
        alertChannelId: "",
      },
    };
  }

  private registerListeners(): void {
    onMessageCreate();
  }
}

export interface IAdminConfig {
  ub3rBot: IUb3rConfig;
}

interface IUb3rConfig {
  userId: string;
  alertChannelId: string;
}
