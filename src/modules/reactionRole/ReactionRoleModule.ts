import { setMessageIdsFromConfig } from "./utils/utils";
import onReady from "./listeners/onReady";
import onMessageReactionAdd from "./listeners/onMessageReactionAdd";
import onMessageReactionRemove from "./listeners/onMessageReactionRemove";
import Module from "../../common/models/Module";
import ReactionMessageDB from "./providers/ReactionMessage.Database";

export default class ReactionRoleModule extends Module<IReactionRoleConfig> {
  constructor(config: IReactionRoleConfig) {
    super("ReactionRole", config);
  }

  protected async setup(): Promise<void> {
    setMessageIdsFromConfig();

    this.registerListeners();
  }

  protected async cleanup(): Promise<void> {
    ReactionMessageDB.getInstance().close();
  }

  protected getDefaultConfig(): IReactionRoleConfig {
    return {
      channelId: "",
      reactionRoles: [],
    };
  }

  private registerListeners(): void {
    onMessageReactionAdd();
    onMessageReactionRemove();
    onReady();
  }
}

export interface IReactionRoleConfig {
  channelId: string;
  reactionRoles: IReactionRolesConfig[];
}

interface IReactionRolesConfig {
  name: string;
  description: string;
  colorHex: string;
  roleId: string;
  emojiId: string;
}
