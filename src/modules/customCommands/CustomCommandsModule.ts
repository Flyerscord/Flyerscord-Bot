import Module from "../../common/models/Module";
import SlashCommand from "../../common/models/SlashCommand";
import TextCommand from "../../common/models/TextCommand";
import onMessageCreate from "./listeners/onMessageCreate";
import Imgur from "./utils/Imgur";

export default class CustomCommandsModule extends Module {
  constructor() {
    super("CustomCommands");
  }

  protected override setup(): void {
    this.readInCommands<SlashCommand>("slash");
    this.readInCommands<TextCommand>("text");

    this.registerListeners();

    Imgur.getInstance();
  }

  private registerListeners(): void {
    onMessageCreate();
  }
}
