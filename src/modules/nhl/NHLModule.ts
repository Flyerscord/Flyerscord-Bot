import { z } from "zod";

import Zod from "@common/utils/ZodWrapper";
import Module, { IModuleConfigSchema } from "@common/models/Module";
import SlashCommand from "@common/models/SlashCommand";
import schema from "./db/schema";
import CreateGameDayPostTask from "./tasks/CreateGameDayPostTask";
import CloseAndLockPostsTask from "./tasks/CloseAndLockPostsTask";
import onReady from "./listeners/onReady";
import NHLDB from "./db/NHLDB";

export const nhlConfigSchema = [
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
  {
    key: "livedata.periodNotificationRoleId",
    description: "The role ID of the role to send period notifications to",
    required: true,
    secret: false,
    requiresRestart: false,
    defaultValue: "",
    schema: Zod.string(),
  },
] as const satisfies readonly IModuleConfigSchema[];

export default class NHLModule extends Module {
  protected readonly CONFIG_SCHEMA = nhlConfigSchema;

  constructor() {
    super("NHL", { schema });
  }

  protected async setup(): Promise<void> {
    const db = new NHLDB();
    await db.ensureLiveDataRowExists();

    await this.readInCommands<SlashCommand>(__dirname, "slash");
    this.registerTasks();
    this.registerListeners();
  }

  protected async cleanup(): Promise<void> {
    CreateGameDayPostTask.getInstance().stopScheduledJob();
    CloseAndLockPostsTask.getInstance().stopScheduledJob();
  }

  private registerTasks(): void {
    // Run every day at 12:30 AM
    CreateGameDayPostTask.getInstance().createScheduledJob();

    // Run every day at 4:30 AM
    CloseAndLockPostsTask.getInstance().createScheduledJob();
  }

  private registerListeners(): void {
    onReady();
  }
}
