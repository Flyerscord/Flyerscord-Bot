import { setMessageIdsFromConfig } from "./utils/utils";
import onReady from "./listeners/onReady";
import onMessageReactionAdd from "./listeners/onMessageReactionAdd";
import onMessageReactionRemove from "./listeners/onMessageReactionRemove";
import Module from "@common/models/Module";
import { IKeyedObject } from "@common/interfaces/IKeyedObject";
import schema from "./db/schema";

export default class ReactionRoleModule extends Module<IReactionRoleConfig> {
  constructor(config: IKeyedObject) {
    super("ReactionRole", config, schema);
  }

  protected async setup(): Promise<void> {
    await setMessageIdsFromConfig();

    this.registerListeners();
  }

  protected async cleanup(): Promise<void> {}

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

export interface IReactionRolesConfig {
  name: string;
  description: string;
  colorHex: string;
  roleId: string;
  emojiId: string;
  messageId: string | undefined;
}
