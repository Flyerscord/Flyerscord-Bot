import Module from "../../common/models/Module";
import SlashCommand from "../../common/models/SlashCommand";
import onMessageCreate from "./listeners/onMessageCreate";
import { calculateLevels } from "./utils/requiredExp";
import LevelExpDB from "./providers/LevelExp.Database";
import LevelsDB from "./providers/Levels.Database";

export default class LevelsModule extends Module {
  constructor() {
    super("Levels");
  }

  protected async setup(): Promise<void> {
    await this.readInCommands<SlashCommand>(__dirname, "slash");

    this.registerListeners();

    calculateLevels(1000);
  }

  protected async cleanup(): Promise<void> {
    LevelExpDB.getInstance().close();
    LevelsDB.getInstance().close();
  }

  private registerListeners(): void {
    onMessageCreate();
  }
}
