import Module from "@common/models/Module";
import RulesDB from "./providers/Rules.Database";

export default class RulesModule extends Module<IRulesConfig> {
  constructor(config: IRulesConfig) {
    super("Rules", config);
  }

  protected async setup(): Promise<void> {
    // Nothing to setup
  }

  protected async cleanup(): Promise<void> {
    RulesDB.getInstance().close();
  }

  getDefaultConfig(): IRulesConfig {
    return {
      channelId: "",
      sections: [],
    };
  }
}

export interface IRulesConfig {
  channelId: string;
  sections: IRulesSectionConfig[];
}

export interface IRulesSectionConfig {
  name: string;
  image: string;
}
