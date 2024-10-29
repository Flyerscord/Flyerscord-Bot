import Module from "../../common/models/Module.js";
import onGuildMemberAdd from "./listeners/onGuildMemberAdd.js";
import onGuildMemberRemove from "./listeners/onGuildMemberRemove.js";

export default class JoinLeaveModule extends Module {
  constructor() {
    super("JoinLeave");
  }

  protected override setup(): void {
    this.registerListeners();
  }

  private registerListeners(): void {
    onGuildMemberAdd();
    onGuildMemberRemove();
  }
}
