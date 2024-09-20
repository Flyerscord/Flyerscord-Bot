import Module from "../../common/models/Module";
import SlashCommand from "../../common/models/SlashCommand";

export default class LevelsModule extends Module {
    constructor() {
        super("Levels");
    }

    protected override setup(): void {
        this.readInCommands<SlashCommand>("slash");
    }
}