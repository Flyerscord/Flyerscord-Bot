import { Collection } from "discord.js";
import ModalMenu from "../models/ModalMenu";
import Stumper from "stumper";

export default class ModalMenuManager {
    private static instance: ModalMenuManager;

    private commands: Collection<string, ModalMenu>;

    private constructor() {
        this.commands = new Collection();
    }

    public static getInstance(): ModalMenuManager {
        if (!ModalMenuManager.instance) {
            ModalMenuManager.instance = new ModalMenuManager();
        }
        return ModalMenuManager.instance;
    }

    public addCommands(commands: Array<ModalMenu>): void {
        commands.forEach((command) => this.addCommand(command));
    }

    public addCommand(command: ModalMenu): void {
        if (this.hasCommand(command)) {
            Stumper.warning(`ModalMenu ${command.title} already exists`);
            return;
        }
        this.commands.set(command.title, command);
    }

    public getCommands(): Collection<string, ModalMenu> {
        return this.commands;
    }

    public hasCommand(command: ModalMenu): boolean {
        return this.commands.has(command.title);
    }
}