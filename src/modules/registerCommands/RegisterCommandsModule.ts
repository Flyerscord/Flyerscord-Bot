import { IKeyedObject } from "@common/interfaces/IKeyedObject";
import Module, { IModuleConfigSchema } from "@common/models/Module";
import TextCommand from "@common/models/TextCommand";

export type RegisterCommandsConfigKeys = "";

export default class RegisterCommandsModule extends Module<RegisterCommandsConfigKeys> {
  constructor(config: IKeyedObject) {
    super("RegisterCommands", config);
  }

  protected async setup(): Promise<void> {
    await this.readInCommands<TextCommand>(__dirname, "text");
  }

  protected async cleanup(): Promise<void> {}

  protected getConfigSchema(): IModuleConfigSchema<RegisterCommandsConfigKeys>[] {
    return [];
  }
}
