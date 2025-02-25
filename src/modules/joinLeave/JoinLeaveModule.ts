import Module from "../../common/models/Module";
import onGuildMemberAdd from "./listeners/onGuildMemberAdd";
import onGuildMemberRemove from "./listeners/onGuildMemberRemove";

export default class JoinLeaveModule extends Module {
  constructor() {
    super("JoinLeave");
  }

  protected async setup(): Promise<void> {
    this.registerListeners();
  }

  protected async cleanup(): Promise<void> {
    // Nothing to cleanup
  }

  private registerListeners(): void {
    onGuildMemberAdd();
    onGuildMemberRemove();
  }
}
