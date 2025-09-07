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
      u3berBot: {
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
  u3berBot: IUb3erConfig;
}

interface IUb3erConfig {
  userId: string;
  alertChannelId: string;
}
