import Module, { IModuleConfigSchema } from "@common/models/Module";
import TextCommand from "@common/models/TextCommand";

export const registerCommandsConfigSchema = [] as const satisfies readonly IModuleConfigSchema[];

export default class RegisterCommandsModule extends Module {
  protected readonly CONFIG_SCHEMA = registerCommandsConfigSchema;

  constructor() {
    super("RegisterCommands", { loadPriority: 1000 });
  }

  protected async setup(): Promise<void> {
    await this.readInCommands<TextCommand>(__dirname, "text");
  }

  protected async cleanup(): Promise<void> {}
}
