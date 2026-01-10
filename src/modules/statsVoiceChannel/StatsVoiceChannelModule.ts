import { IKeyedObject } from "@common/interfaces/IKeyedObject";
import Module, { IModuleConfigSchema } from "@common/models/Module";
import SlashCommand from "@common/models/SlashCommand";
import TotalMembersStatChannel from "./statChannels/TotalMembersStatChannel";
import TotalNitroBoostersStatChannel from "./statChannels/TotalNitroBoostersStatChannel";
import UpdateStatsChannelsTask from "./tasks/UpdateStatsChannelsTask";
import StatsVoiceChannelsManager from "./utils/StatsVoiceChannelsManager";
import Zod from "@common/utils/ZodWrapper";
import { z } from "zod";

export type StatsVoiceChannelConfigKeys = "channels";

export default class StatsVoiceChannelModule extends Module<StatsVoiceChannelConfigKeys> {
  constructor(config: IKeyedObject) {
    super("StatsVoiceChannel", config);
  }

  protected async setup(): Promise<void> {
    await this.readInCommands<SlashCommand>(__dirname, "slash");

    this.registerStatChannels();
    this.registerSchedules();
  }

  protected async cleanup(): Promise<void> {}

  protected getConfigSchema(): IModuleConfigSchema<StatsVoiceChannelConfigKeys>[] {
    return [
      {
        key: "channels",
        description: "The channels to create stats voice channels in",
        required: false,
        secret: false,
        requiresRestart: true,
        defaultValue: [],
        schema: z.array(
          z.object({
            name: Zod.string(),
            channelId: Zod.string(),
          }),
        ),
      },
    ];
  }

  private registerSchedules(): void {
    UpdateStatsChannelsTask.getInstance().createScheduledJob();
  }

  private registerStatChannels(): void {
    const manager = StatsVoiceChannelsManager.getInstance();

    manager.addStatChannel(new TotalMembersStatChannel());
    manager.addStatChannel(new TotalNitroBoostersStatChannel());
  }
}
