import ContextMenuCommand from "@common/models/ContextMenuCommand";
import Module, { IModuleConfigSchema } from "@common/models/Module";
import SlashCommand from "@common/models/SlashCommand";
import schema from "./db/schema";
import Zod from "@common/utils/ZodWrapper";

export const pinsConfigSchema = [
  {
    key: "channelId",
    description: "The channel ID of the pins channel",
    required: true,
    secret: false,
    requiresRestart: true,
    defaultValue: "",
    schema: Zod.string(),
  },
] as const satisfies readonly IModuleConfigSchema[];

export default class PinsModule extends Module {
  protected readonly CONFIG_SCHEMA = pinsConfigSchema;

  constructor() {
    super("Pins", { schema });
  }

  protected async setup(): Promise<void> {
    await this.readInCommands<SlashCommand>(__dirname, "slash");
    await this.readInCommands<ContextMenuCommand>(__dirname, "context");
  }

  protected async cleanup(): Promise<void> {}
}
