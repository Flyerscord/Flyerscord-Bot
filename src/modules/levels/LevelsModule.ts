import Module from "../../common/models/Module";
import SlashCommand from "../../common/models/SlashCommand";
import onMessageCreate from "./listeners/onMessageCreate";
import { calculateLevels } from "./utils/requiredExp";

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