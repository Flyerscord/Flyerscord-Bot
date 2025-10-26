import { IKeyedObject } from "@common/interfaces/IKeyedObject";
import Module from "@common/models/Module";
import onGuildMemberAdd from "./listeners/onGuildMemberAdd";
import onMessageReactionAdd from "./listeners/onMessageReactionAdd";
import onMessageReactionRemove from "./listeners/onMessageReactionRemove";
import onReady from "./listeners/onReady";
import schema from "./schema/schema";

export default class VistorRoleModule extends Module<IVisitorRoleConfig> {
  constructor(config: IKeyedObject) {
    super("VisitorRole", config, schema);
  }

  protected async setup(): Promise<void> {
    this.registerListeners();
  }

  protected async cleanup(): Promise<void> {
    // Nothing to cleanup
  }

  protected getDefaultConfig(): IVisitorRoleConfig {
    return {
      memberRoleId: "",
      visitorRoleId: "",
      visitorEmojiId: "",
      rolesChannelId: "",
    };
  }

  private registerListeners(): void {
    onGuildMemberAdd();
    onMessageReactionAdd();
    onMessageReactionRemove();
    onReady();
  }
}

export interface IVisitorRoleConfig {
  memberRoleId: string;
  visitorRoleId: string;
  visitorEmojiId: string;
  rolesChannelId: string;
}
