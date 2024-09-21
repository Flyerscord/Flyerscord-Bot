import Module from "../../common/models/Module";
import onMessageCreate from "./listeners/onMessageCreate";

export default class CustomCommandsModule extends Module {
  constructor() {
    super("CustomCommands");
  }

  protected override setup(): void {
    this.registerListeners();
  }

  private registerListeners(): void {
    onMessageCreate();
  }
}
