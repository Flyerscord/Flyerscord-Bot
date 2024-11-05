import Module from "../../common/models/Module";
import TextCommand from "../../common/models/TextCommand";

export default class RegisterCommandsModule extends Module {
  constructor() {
    super("RegisterCommands");
  }

  protected async setup(): Promise<void> {
    await this.readInCommands<TextCommand>(__dirname, "text");
  }
}
