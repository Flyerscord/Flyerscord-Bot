import Module, { IModuleConfigSchema } from "@common/models/Module";
import SlashCommand from "@common/models/SlashCommand";
import CloseAndLockPostsTask from "./tasks/CloseAndLockPostsTask";
import CreateGameDayPostTask from "./tasks/CreateGameDayPostTask";
import schema from "./db/schema";
import Zod from "@common/utils/ZodWrapper";
import { z } from "zod";

export const gameDayPostsConfigSchema = [
  {
    key: "channelId",
    description: "The channel ID of the forum channel that the posts will be created in",
    required: true,
    secret: false,
    requiresRestart: true,
    defaultValue: "",
    schema: Zod.string(),
  },
  {
    key: "tagIds.preseason",
    description: "The tag ID of the preseason tag",
    required: true,
    secret: false,
    requiresRestart: true,
    defaultValue: "",
    schema: Zod.string(),
  },
  {
    key: "tagIds.regularSeason",
    description: "The tag ID of the regular season tag",
    required: true,
    secret: false,
    requiresRestart: true,
    defaultValue: "",
    schema: Zod.string(),
  },
  {
    key: "tagIds.postSeason",
    description: "The tag ID of the post season tag",
    required: true,
    secret: false,
    requiresRestart: true,
    defaultValue: "",
    schema: Zod.string(),
  },
  {
    key: "tagIds.seasons",
    description: "The tag IDs of the season tags",
    required: true,
    secret: false,
    requiresRestart: true,
    defaultValue: [],
    schema: z.array(
      z
        .object({
          name: Zod.string(),
          startingYear: Zod.number({ min: 2000, max: 2100 }),
          endingYear: Zod.number({ min: 2000, max: 2100 }),
          tagId: Zod.string(),
        })
        .refine((data) => data.endingYear === data.startingYear + 1, {
          message: "endingYear must be 1 year after startingYear",
          path: ["endingYear"],
        }),
    ),
  },
] as const satisfies readonly IModuleConfigSchema[];

export default class GameDayPostsModule extends Module {
  protected readonly CONFIG_SCHEMA = gameDayPostsConfigSchema;

  constructor() {
    super("GameDayPosts", { schema });
  }

  protected async setup(): Promise<void> {
    await this.readInCommands<SlashCommand>(__dirname, "slash");

    this.registerSchedules();
  }

  protected async cleanup(): Promise<void> {}

  private registerSchedules(): void {
    // Run every day at 12:30 AM
    CreateGameDayPostTask.getInstance().createScheduledJob();

    // Run every day at 4:30 AM
    CloseAndLockPostsTask.getInstance().createScheduledJob();
  }
}
