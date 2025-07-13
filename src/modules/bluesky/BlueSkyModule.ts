import { IKeyedObject } from "@common/interfaces/IKeyedObject";
import Module from "@common/models/Module";
import SlashCommand from "@common/models/SlashCommand";
import AccountHistoryDB from "./providers/AccountHistory.Database";
import BlueSkyDB from "./providers/BlueSky.Database";
import CheckForNewPostsTask from "./tasks/CheckForNewPostsTask";
import BlueSky from "./utils/BlueSky";

export default class BlueSkyModule extends Module<IBlueSkyConfig> {
  constructor(config: IKeyedObject) {
    super("BlueSky", config);
  }

  protected async setup(): Promise<void> {
    await this.readInCommands<SlashCommand>(__dirname, "slash");

    // Login to BlueSky
    BlueSky.getInstance();

    this.registerSchedules();
  }

  protected async cleanup(): Promise<void> {
    AccountHistoryDB.getInstance().close();
    BlueSkyDB.getInstance().close();
  }

  protected getDefaultConfig(): IBlueSkyConfig {
    return {
      username: "",
      password: "",
      channelId: "",
      listId: "",
    };
  }

  private registerSchedules(): void {
    CheckForNewPostsTask.getInstance().createScheduledJob();
  }
}

export interface IBlueSkyConfig {
  username: string;
  password: string;
  channelId: string;
  listId: string;
}
