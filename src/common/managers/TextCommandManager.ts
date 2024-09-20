import { Collection } from "discord.js";
import TextCommand from "../models/TextCommand";
import Stumper from "stumper";

export default class TextCommandManager {
    private static instance: TextCommandManager;

    private commands: Collection<string, TextCommand>;

    private constructor() {
        this.commands = new Collection();
    }

    public static getInstance(): TextCommandManager {
        if (!TextCommandManager.instance) {
            TextCommandManager.instance = new TextCommandManager();
        }
        return TextCommandManager.instance;
    }

    public addCommands(commands: Array<TextCommand>): void {
        commands.forEach((command) => this.addCommand(command));
    }

    public addCommand(command: TextCommand): void {
        if (this.hasCommand(command)) {
            Stumper.warning(`Text command ${command.name} already exists`);
            return;
        }
        this.commands.set(command.name, command);
    }

    public getCommands(): Collection<string, TextCommand> {
        return this.commands;
    }

    public hasCommand(command: TextCommand): boolean {
        return this.commands.has(command.name);
    }
}