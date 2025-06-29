import { IKeyedObject } from "@common/interfaces/IKeyedObject";
import Module from "@common/models/Module";
import onGuildMemberAdd from "./listeners/onGuildMemberAdd";
import onGuildMemberRemove from "./listeners/onGuildMemberRemove";

export default class JoinLeaveModule extends Module<IJoinLeaveConfig> {
  constructor(config: IKeyedObject) {
    super("JoinLeave", config);
  }

  protected async setup(): Promise<void> {
    this.registerListeners();
  }

  protected async cleanup(): Promise<void> {
    // Nothing to cleanup
  }

  protected getDefaultConfig(): IJoinLeaveConfig {
    return {
      channelId: "",
    };
  }

  private registerListeners(): void {
    onGuildMemberAdd();
    onGuildMemberRemove();
  }
}

export interface IJoinLeaveConfig {
  channelId: string;
}
