import { LOG_LEVEL } from "stumper";
import schema from "./db/schema";
import Module, { IModuleConfigSchema } from "./models/Module";
import Zod from "./utils/ZodWrapper";
import TextCommand from "./models/TextCommand";
import CombinedTeamInfoCache from "./cache/CombinedTeamInfoCache";

export const commonConfigSchema = [
  {
    key: "logLevel",
    description: "The log level to use",
    required: false,
    secret: true,
    requiresRestart: true,
    defaultValue: LOG_LEVEL.INFO,
    schema: Zod.number({ min: 0, max: 3 }),
  },
  {
    key: "masterGuildId",
    description: "The guild ID of the master guild",
    required: true,
    secret: true,
    requiresRestart: true,
    defaultValue: "",
    schema: Zod.string(),
  },
  {
    key: "adminPrefix",
    description: "The prefix for the admin commands",
    required: false,
    secret: true,
    requiresRestart: true,
    defaultValue: ".",
    schema: Zod.string({ min: 1, max: 1 }),
  },
  {
    key: "adminLoungeChannelId",
    description: "The channel ID of the admin lounge channel",
    required: true,
    secret: false,
    requiresRestart: false,
    defaultValue: "",
    schema: Zod.string(),
  },
] as const satisfies readonly IModuleConfigSchema[];

export default class CommonModule extends Module {
  protected readonly CONFIG_SCHEMA = commonConfigSchema;

  constructor() {
    super("Common", { schema, loadPriority: -1 });
  }

  protected async setup(): Promise<void> {
    await this.readInCommands<TextCommand>(__dirname, "text");

    await this.registerCaches();
  }

  protected async cleanup(): Promise<void> {}

  private async registerCaches(): Promise<void> {
    // TODO: #123 Move this cache to the NHL module
    const combinedTeamInfoCache = CombinedTeamInfoCache.getInstance();
    await combinedTeamInfoCache.forceUpdate();
    combinedTeamInfoCache.createScheduledJob();
  }
}
