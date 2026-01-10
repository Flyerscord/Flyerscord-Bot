import { LOG_LEVEL } from "stumper";
import schema from "./db/schema";
import Module, { IModuleConfigSchema } from "./models/Module";
import Zod from "./utils/ZodWrapper";
import { z } from "zod";

export type CommonConfigKeys = "productionMode" | "logLevel" | "masterGuildId" | "adminPrefix" | "advancedDebug";

export const commonConfigSchema = [
  {
    key: "productionMode",
    description: "Whether the bot is in production mode or not",
    required: false,
    secret: true,
    requiresRestart: true,
    defaultValue: false,
    schema: z.boolean(),
  },
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
    key: "advancedDebug",
    description: "Whether to enable advanced debug logging",
    required: false,
    secret: true,
    requiresRestart: true,
    defaultValue: false,
    schema: z.boolean(),
  },
] as const satisfies readonly IModuleConfigSchema<CommonConfigKeys>[];

export default class CommonModule extends Module<CommonConfigKeys> {
  constructor() {
    super("Common", schema);
  }

  protected async setup(): Promise<void> {}

  protected async cleanup(): Promise<void> {}

  getConfigSchema(): IModuleConfigSchema<CommonConfigKeys>[] {
    return [...commonConfigSchema];
  }
}
