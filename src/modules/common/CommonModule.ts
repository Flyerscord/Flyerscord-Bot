import Module from "../../common/models/Module";
import SlashCommand from "../../common/models/SlashCommand";

export default class CommonModule extends Module {
    constructor() {
        super("Common");
    }

    protected override setup(): void {
        this.readInCommands<SlashCommand>("slash");
    }
}