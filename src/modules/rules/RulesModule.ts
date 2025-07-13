import Module from "@common/models/Module";
import RulesDB from "./providers/Rules.Database";
import SlashCommand from "@common/models/SlashCommand";
import { IKeyedObject } from "@common/interfaces/IKeyedObject";
import ModalMenu from "@common/models/ModalMenu";

export default class RulesModule extends Module<IRulesConfig> {
  constructor(config: IKeyedObject) {
    super("Rules", config);
  }

  protected async setup(): Promise<void> {
    await this.readInCommands<SlashCommand>(__dirname, "slash");
    await this.readInCommands<ModalMenu>(__dirname, "modal");
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
}

export interface IRulesConfig {
  channelId: string;
  sections: string[];
}
