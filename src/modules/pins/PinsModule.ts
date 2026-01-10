import { IKeyedObject } from "@common/interfaces/IKeyedObject";
import ContextMenuCommand from "@common/models/ContextMenuCommand";
import Module, { IModuleConfigSchema } from "@common/models/Module";
import SlashCommand from "@common/models/SlashCommand";
import schema from "./db/schema";
import Zod from "@common/utils/ZodWrapper";

export type BlueSkyConfigKeys = "channelId";

export default class PinsModule extends Module<BlueSkyConfigKeys> {
  constructor(config: IKeyedObject) {
    super("Pins", config, schema);
  }

  protected async setup(): Promise<void> {
    await this.readInCommands<SlashCommand>(__dirname, "slash");
    await this.readInCommands<ContextMenuCommand>(__dirname, "context");
  }

  protected async cleanup(): Promise<void> {}

  protected getConfigSchema(): IModuleConfigSchema<BlueSkyConfigKeys>[] {
    return [
      {
        key: "channelId",
        description: "The channel ID of the pins channel",
        required: true,
        secret: false,
        requiresRestart: true,
        defaultValue: "",
        schema: Zod.string(),
      },
    ];
  }
}
