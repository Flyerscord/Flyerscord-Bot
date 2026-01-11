import Module, { IModuleConfigSchema } from "@common/models/Module";
import RulesDB from "./db/RulesDB";
import SlashCommand from "@common/models/SlashCommand";
import schema from "./db/schema";
import ConfigManager from "@root/src/common/managers/ConfigManager";
import Zod from "@common/utils/ZodWrapper";
import { z } from "zod";

export type RulesConfigKeys = "channelId" | "sections";

export const rulesConfigSchema = [
  {
    key: "channelId",
    description: "The channel ID of the rules channel",
    required: true,
    secret: false,
    requiresRestart: true,
    defaultValue: "",
    schema: Zod.string(),
  },
  {
    key: "sections",
    description: "The sections to create in the rules channel",
    required: false,
    secret: false,
    requiresRestart: true,
    defaultValue: ["Welcome", "Rules", "Staff", "Roles", "Channels", "Servers"],
    schema: z.array(Zod.string()).min(1),
  },
] as const satisfies readonly IModuleConfigSchema<RulesConfigKeys>[];

export default class RulesModule extends Module<RulesConfigKeys> {
  constructor() {
    super("Rules", { schema });
  }

  protected async setup(): Promise<void> {
    const db = new RulesDB();
    const rulesConfig = ConfigManager.getInstance().getConfig("Rules");

    for (const section of rulesConfig.sections) {
      await db.ensureSectionExists(section, section);
    }

    await this.readInCommands<SlashCommand>(__dirname, "slash");
  }

  protected async cleanup(): Promise<void> {}

  getConfigSchema(): IModuleConfigSchema<RulesConfigKeys>[] {
    return [...rulesConfigSchema];
  }
}
