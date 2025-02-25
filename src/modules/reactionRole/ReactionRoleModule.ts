import { setMessageIdsFromConfig } from "./utils/utils";
import onReady from "./listeners/onReady";
import onMessageReactionAdd from "./listeners/onMessageReactionAdd";
import onMessageReactionRemove from "./listeners/onMessageReactionRemove";
import Module from "../../common/models/Module";

export default class ReactionRoleModule extends Module {
  constructor() {
    super("ReactionRole");
  }

  protected async setup(): Promise<void> {
    setMessageIdsFromConfig();

    this.registerListeners();
  }

  private registerListeners(): void {
    onMessageReactionAdd();
    onMessageReactionRemove();
    onReady();
  }
}
