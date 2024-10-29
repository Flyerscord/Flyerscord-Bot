import Module from "../../common/models/Module.js";
import SlashCommand from "../../common/models/SlashCommand.js";
import TextCommand from "../../common/models/TextCommand.js";
import onMessageCreate from "./listeners/onMessageCreate.js";
import Imgur from "./utils/Imgur.js";

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
