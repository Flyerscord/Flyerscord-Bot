import Module from "../../common/models/Module";
import SlashCommand from "../../common/models/SlashCommand";
import onAutocomplete from "./listeners/onAutocomplete";
import AccountHistoryDB from "./providers/AccountHistory.Database";
import BlueSkyDB from "./providers/BlueSky.Database";
import CheckForNewPostsTask from "./tasks/CheckForNewPostsTask";
import BlueSky from "./utils/BlueSky";

export default class BlueSkyModule extends Module {
  constructor() {
    super("BlueSky");
  }

  protected async setup(): Promise<void> {
    await this.readInCommands<SlashCommand>(__dirname, "slash");

    // Login to BlueSky
    BlueSky.getInstance();

    this.registerListeners();
    this.registerSchedules();
  }

  protected async cleanup(): Promise<void> {
    AccountHistoryDB.getInstance().close();
    BlueSkyDB.getInstance().close();
  }

  private registerSchedules(): void {
    new CheckForNewPostsTask().createScheduledJob();
  }

  private registerListeners(): void {
    onAutocomplete();
  }
}
