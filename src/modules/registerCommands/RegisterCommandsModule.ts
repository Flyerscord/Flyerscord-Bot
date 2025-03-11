import { IKeyedObject } from "../../common/interfaces/IKeyedObject";
import Module from "../../common/models/Module";
import TextCommand from "../../common/models/TextCommand";

export default class RegisterCommandsModule extends Module<IRegisterCommandsConfig> {
  constructor(config: IKeyedObject) {
    super("RegisterCommands", config);
  }

  protected async setup(): Promise<void> {
    await this.readInCommands<TextCommand>(__dirname, "text");
  }

  protected async cleanup(): Promise<void> {
    // Nothing to cleanup
  }

  protected getDefaultConfig(): IRegisterCommandsConfig {
    return {};
  }
}

export interface IRegisterCommandsConfig {}
