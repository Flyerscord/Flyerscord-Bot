import Module from "../../common/models/Module";
import TextCommand from "../../common/models/TextCommand";

export default class RegisterCommandsModule extends Module<IRegisterCommandsConfig> {
  protected constructor(config: IRegisterCommandsConfig) {
    super("RegisterCommands", config);
  }

  protected async setup(): Promise<void> {
    await this.readInCommands<TextCommand>(__dirname, "text");
  }

  protected async cleanup(): Promise<void> {
    // Nothing to cleanup
  }

  protected getDefaultConfig(): IRegisterCommandsConfig {
    return {
      prefix: ".",
    };
  }
}

export interface IRegisterCommandsConfig {
  prefix: string;
}
