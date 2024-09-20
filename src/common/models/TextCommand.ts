import { Message } from "discord.js";
import ITextCommandOptions from "../interfaces/ITextCommandOptions";

export default abstract class TextCommand {
    readonly name: string;
    readonly command: string;
    readonly description: string;
    readonly options?: ITextCommandOptions;

    constructor(name: string, command: string, options?: ITextCommandOptions) {
        this.name = name;
        this.command = command;
        this.options = options;
        this.description = options?.description || "";
    }

    abstract execute(message: Message, args: Array<string>): Promise<void>;

    protected checkPermissions(message: Message): boolean {
        if (this.options) {
            if (this.options.allowedPermissions) {
                for (let i = 0; i < this.options.allowedPermissions.length; i++) {
                    const permission = this.options.allowedPermissions[i];
                    if (message.member?.permissions.has(permission)) {
                        return true;
                    }
                }
            }

            if (this.options.allowedUsers) {
                if (message.member?.user.id && this.options.allowedUsers.includes(message.member?.user.id)) {
                    return true;
                }
            }

            if (this.options.allowedRoles) {
                for (let i = 0; i < this.options.allowedRoles.length; i++) {
                    const role = this.options.allowedRoles[i];
                    if (message.member?.roles.cache.has(role)) {
                        return true;
                    }
                }
            }
            return false;
        }
        return true;
    }

    public toString(): string {
        return JSON.stringify(this);
    }
}