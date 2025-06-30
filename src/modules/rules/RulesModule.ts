import Module from "@common/models/Module";

export default class RulesModule extends Module<IRulesConfig> {
  constructor(config: IRulesConfig) {
    super("Rules", config);
  }

  protected async setup(): Promise<void> {
    // Nothing to setup
  }

  protected async cleanup(): Promise<void> {
    // Nothing to cleanup
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
