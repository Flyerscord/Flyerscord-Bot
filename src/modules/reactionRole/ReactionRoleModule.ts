import { setMessageIdsFromConfig } from "./utils/utils";
import onReady from "./listeners/onReady";
import onMessageReactionAdd from "./listeners/onMessageReactionAdd";
import onMessageReactionRemove from "./listeners/onMessageReactionRemove";
import Module from "../../common/models/Module";
import ReactionMessageDB from "./providers/ReactionMessage.Database";

export default class ReactionRoleModule extends Module {
  constructor() {
    super("ReactionRole");
  }

  protected async setup(): Promise<void> {
    setMessageIdsFromConfig();

    this.registerListeners();
  }

  protected async cleanup(): Promise<void> {
    ReactionMessageDB.getInstance().close();
  }

  private registerListeners(): void {
    onMessageReactionAdd();
    onMessageReactionRemove();
    onReady();
  }
}
