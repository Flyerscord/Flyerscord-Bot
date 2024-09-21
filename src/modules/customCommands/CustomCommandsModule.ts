import Module from "../../common/models/Module";
import onMessageCreate from "./listeners/onMessageCreate";
import Imgur from "./utils/Imgur";

export default class CustomCommandsModule extends Module {
  constructor() {
    super("CustomCommands");
  }

  protected override setup(): void {
    this.registerListeners();

    Imgur.getInstance();
  }

  private registerListeners(): void {
    onMessageCreate();
  }
}
