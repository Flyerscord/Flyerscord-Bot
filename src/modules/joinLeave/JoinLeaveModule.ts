import Module from "../../common/models/Module";
import onGuildMemberAdd from "./listeners/onGuildMemberAdd";
import onGuildMemberRemove from "./listeners/onGuildMemberRemove";

export default class JoinLeaveModule extends Module {
  constructor() {
    super("JoinLeave");
  }

  protected override async setup(): Promise<void> {
    this.registerListeners();
  }

  private registerListeners(): void {
    onGuildMemberAdd();
    onGuildMemberRemove();
  }
}
