import Module from "@common/models/Module";
import RulesDB from "./providers/Rules.Database";
import onAutoComplete from "./listeners/onAutoComplete";
import SlashCommand from "@common/models/SlashCommand";

export default class RulesModule extends Module<IRulesConfig> {
  constructor(config: IRulesConfig) {
    super("Rules", config);
  }

  protected async setup(): Promise<void> {
    await this.readInCommands<SlashCommand>(__dirname, "slash");

    this.registerListeners();
  }

  protected async cleanup(): Promise<void> {
    RulesDB.getInstance().close();
  }

  getDefaultConfig(): IRulesConfig {
    return {
      channelId: "",
      sections: ["Welcome", "Rules", "Staff", "Roles", "Channels", "Servers"],
    };
  }

  private registerListeners(): void {
    onAutoComplete();
  }
}

export interface IRulesConfig {
  channelId: string;
  sections: string[];
}
