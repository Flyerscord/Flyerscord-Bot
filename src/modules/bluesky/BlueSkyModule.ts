import Module, { IModuleConfigSchema } from "@common/models/Module";
import SlashCommand from "@common/models/SlashCommand";
import CheckForNewPostsTask from "./tasks/CheckForNewPostsTask";
import BlueSky from "./utils/BlueSky";
import schema from "./db/schema";
import Zod from "@common/utils/ZodWrapper";

export const blueSkyConfigSchema = [
  {
    key: "username",
    description: "BlueSky username",
    required: true,
    secret: true,
    requiresRestart: true,
    defaultValue: "",
    schema: Zod.string(),
  },
  {
    key: "password",
    description: "BlueSky password",
    required: true,
    secret: true,
    requiresRestart: true,
    defaultValue: "",
    schema: Zod.encryptedString(),
  },
  {
    key: "channelId",
    description: "Channel that posts will be posted to",
    required: true,
    secret: false,
    requiresRestart: true,
    defaultValue: "",
    schema: Zod.string(),
  },
  {
    key: "listId",
    description: "The BlueSky list Id that will be used to pull posts from",
    required: true,
    secret: false,
    requiresRestart: true,
    defaultValue: "",
    schema: Zod.string(),
  },
] as const satisfies readonly IModuleConfigSchema[];

export default class BlueSkyModule extends Module {
  protected readonly CONFIG_SCHEMA = blueSkyConfigSchema;

  constructor() {
    super("BlueSky", { schema });
  }

  protected async setup(): Promise<void> {
    await this.readInCommands<SlashCommand>(__dirname, "slash");

    // Login to BlueSky
    BlueSky.getInstance();

    this.registerSchedules();
  }

  protected async cleanup(): Promise<void> {}

  private registerSchedules(): void {
    CheckForNewPostsTask.getInstance().createScheduledJob();
  }
}
