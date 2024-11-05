import Module from "../../common/models/Module";
import onMessageReactionAdd from "./listeners/onMessageReactionAdd";
import onMessageReactionRemove from "./listeners/onMessageReactionRemove";
import onReady from "./listeners/onReady";

export default class BagReactionRoleModule extends Module {
  constructor() {
    super("BagReactioRole");
  }

  protected async setup(): Promise<void> {
    this.registerListeners();
  }

  private registerListeners(): void {
    onMessageReactionAdd();
    onMessageReactionRemove();
    onReady();
  }
}
