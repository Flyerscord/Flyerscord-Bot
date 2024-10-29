import Module from "../../common/models/Module";
import onGuildMemberAdd from "./listeners/onGuildMemberAdd";
import onMessageReactionAdd from "./listeners/onMessageReactionAdd";
import onMessageReactionRemove from "./listeners/onMessageReactionRemove";
import onReady from "./listeners/onReady";

export default class VistorRoleModule extends Module {
  constructor() {
    super("VistorRole");
  }

  protected override async setup(): Promise<void> {
    this.registerListeners();
  }

  private registerListeners(): void {
    onGuildMemberAdd();
    onMessageReactionAdd();
    onMessageReactionRemove();
    onReady();
  }
}
