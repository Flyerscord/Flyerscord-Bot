import Module, { IModuleConfigSchema } from "@common/models/Module";
import onGuildMemberAdd from "./listeners/onGuildMemberAdd";
import onGuildMemberRemove from "./listeners/onGuildMemberRemove";
import Zod from "@common/utils/ZodWrapper";

export const joinLeaveConfigSchema = [
  {
    key: "channelId",
    description: "The channel ID of the channel to send join/leave messages to",
    required: true,
    secret: false,
    requiresRestart: false,
    defaultValue: "",
    schema: Zod.string(),
  },
] as const satisfies readonly IModuleConfigSchema[];

export default class JoinLeaveModule extends Module {
  protected readonly CONFIG_SCHEMA = joinLeaveConfigSchema;

  constructor() {
    super("JoinLeave");
  }

  protected async setup(): Promise<void> {
    this.registerListeners();
  }

  protected async cleanup(): Promise<void> {}

  private registerListeners(): void {
    onGuildMemberAdd();
    onGuildMemberRemove();
  }
}
