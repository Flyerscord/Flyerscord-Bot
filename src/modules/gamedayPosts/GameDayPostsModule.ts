import { IKeyedObject } from "@common/interfaces/IKeyedObject";
import Module from "@common/models/Module";
import SlashCommand from "@common/models/SlashCommand";
import GameDayPostsDB from "./providers/GameDayPosts.Database";
import CloseAndLockPostsTask from "./tasks/CloseAndLockPostsTask";
import CreateGameDayPostTask from "./tasks/CreateGameDayPostTask";

export default class GameDayPostsModule extends Module<IGameDayPostsConfig> {
  constructor(config: IKeyedObject) {
    super("GameDayPosts", config);
  }

  protected async setup(): Promise<void> {
    await this.readInCommands<SlashCommand>(__dirname, "slash");

    this.registerSchedules();
  }

  protected async cleanup(): Promise<void> {
    GameDayPostsDB.getInstance().close();
  }

  protected getDefaultConfig(): IGameDayPostsConfig {
    return {
      channelId: "",
      tagIds: {
        preseason: "",
        regularSeason: "",
        postSeason: "",
        seasons: [],
      },
    };
  }

  private registerSchedules(): void {
    // Run every day at 12:30 AM
    CreateGameDayPostTask.getInstance().createScheduledJob();

    // Run every day at 4:30 AM
    CloseAndLockPostsTask.getInstance().createScheduledJob();
  }
}

export interface IGameDayPostsConfig {
  channelId: string;
  tagIds: IGameDayPostsTagsConfig;
}

interface IGameDayPostsTagsConfig {
  preseason: string;
  regularSeason: string;
  postSeason: string;
  seasons: IGameDaayPostsTagsSeasonConfig[];
}

interface IGameDaayPostsTagsSeasonConfig {
  name: string;
  startingYear: number;
  endingYear: number;
  tagId: string;
}
