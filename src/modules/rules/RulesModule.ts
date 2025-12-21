import Module from "@common/models/Module";
import RulesDB from "./providers/Rules.Database";
import SlashCommand from "@common/models/SlashCommand";
import { IKeyedObject } from "@common/interfaces/IKeyedObject";
import schema from "./db/schema";

export default class RulesModule extends Module<IRulesConfig> {
  constructor(config: IKeyedObject) {
    super("Rules", config, schema);
  }

  protected async setup(): Promise<void> {
    await this.readInCommands<SlashCommand>(__dirname, "slash");
  }

  protected async cleanup(): Promise<void> {
    await RulesDB.getInstance().close();
  }

  getDefaultConfig(): IRulesConfig {
    return {
      channelId: "",
      sections: ["Welcome", "Rules", "Staff", "Roles", "Channels", "Servers"],
    };
  }
}

export interface IRulesConfig {
  channelId: string;
  sections: string[];
}
