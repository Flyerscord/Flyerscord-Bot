import Module from "../../common/models/Module.js";
import SlashCommand from "../../common/models/SlashCommand.js";
import onMessageCreate from "./listeners/onMessageCreate.js";
import { calculateLevels } from "./utils/requiredExp.js";

export default class LevelsModule extends Module {
  constructor() {
    super("Levels");
  }

  protected override setup(): void {
    this.readInCommands<SlashCommand>("slash");

    this.registerListeners();

    calculateLevels(1000);
  }

  private registerListeners(): void {
    onMessageCreate();
  }
}
