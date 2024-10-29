import Module from "../../common/models/Module";
import onGuildMemberAdd from "./listeners/onGuildMemberAdd";
import { createVisitorRoleMessageIfNeeded } from "./utils/utils";
import onMessageReactionAdd from "./listeners/onMessageReactionAdd";
import onMessageReactionRemove from "./listeners/onMessageReactionRemove";

export default class VistorRoleModule extends Module {
  constructor() {
    super("VistorRole");
  }

  protected override async setup(): Promise<void> {
    this.registerListeners();

    await createVisitorRoleMessageIfNeeded();
  }

  private registerListeners(): void {
    onGuildMemberAdd();
    onMessageReactionAdd();
    onMessageReactionRemove();
  }
}
