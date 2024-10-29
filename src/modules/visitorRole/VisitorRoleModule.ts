import Module from "../../common/models/Module.js";
import onGuildMemberAdd from "./listeners/onGuildMemberAdd.js";
import { createVisitorRoleMessageIfNeeded } from "./utils/utils.js";
import onMessageReactionAdd from "./listeners/onMessageReactionAdd.js";
import onMessageReactionRemove from "./listeners/onMessageReactionRemove.js";

export default class VistorRoleModule extends Module {
  constructor() {
    super("VistorRole");
  }

  protected override setup(): void {
    this.registerListeners();

    createVisitorRoleMessageIfNeeded();
  }

  private registerListeners(): void {
    onGuildMemberAdd();
    onMessageReactionAdd();
    onMessageReactionRemove();
  }
}
