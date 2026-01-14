import Module, { IModuleConfigSchema } from "@common/models/Module";
import SlashCommand from "@common/models/SlashCommand";
import onMessageCreate from "./listeners/onMessageCreate";
import Zod from "@common/utils/ZodWrapper";

export type AdminConfigKeys = "ub3rBot.userId" | "ub3rBot.alertChannelId";

export const adminConfigSchema = [
  {
    key: "ub3rBot.userId",
    description: "The user ID of the ub3rBot",
    required: true,
    secret: false,
    requiresRestart: false,
    defaultValue: "",
    schema: Zod.string(),
  },
  {
    key: "ub3rBot.alertChannelId",
    description: "The channel ID of the ub3rBot alert channel",
    required: true,
    secret: false,
    requiresRestart: false,
    defaultValue: "",
    schema: Zod.string(),
  },
] as const satisfies readonly IModuleConfigSchema[];

export default class AdminModule extends Module {
  protected readonly CONFIG_SCHEMA = adminConfigSchema;

  constructor() {
    super("Admin");
  }

  protected async setup(): Promise<void> {
    await this.readInCommands<SlashCommand>(__dirname, "slash");

    this.registerListeners();
  }

  protected async cleanup(): Promise<void> {}

  private registerListeners(): void {
    onMessageCreate();
  }
}
