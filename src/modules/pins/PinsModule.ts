import { IKeyedObject } from "@common/interfaces/IKeyedObject";
import ContextMenuCommand from "../../common/models/ContextMenuCommand";
import Module from "../../common/models/Module";
import SlashCommand from "../../common/models/SlashCommand";
import PinsDB from "./providers/Pins.Database";

export default class PinsModule extends Module<IPinsConfig> {
  constructor(config: IKeyedObject) {
    super("Pins", config);
  }

  protected async setup(): Promise<void> {
    await this.readInCommands<SlashCommand>(__dirname, "slash");
    await this.readInCommands<ContextMenuCommand>(__dirname, "context");
  }

  protected async cleanup(): Promise<void> {
    PinsDB.getInstance().close();
  }

  getDefaultConfig(): IPinsConfig {
    return {
      channelId: "",
    };
  }
}

export interface IPinsConfig {
  channelId: string;
}
