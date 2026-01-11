import Module, { IModuleConfigSchema } from "@common/models/Module";
import onGuildMemberAdd from "./listeners/onGuildMemberAdd";
import onGuildMemberRemove from "./listeners/onGuildMemberRemove";
import Zod from "@common/utils/ZodWrapper";

export type JoinLeaveConfigKeys = "channelId";

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
] as const satisfies readonly IModuleConfigSchema<JoinLeaveConfigKeys>[];

export default class JoinLeaveModule extends Module<JoinLeaveConfigKeys> {
  constructor() {
    super("JoinLeave");
  }

  protected async setup(): Promise<void> {
    this.registerListeners();
  }

  protected async cleanup(): Promise<void> {}

  getConfigSchema(): IModuleConfigSchema<JoinLeaveConfigKeys>[] {
    return [...joinLeaveConfigSchema];
  }

  private registerListeners(): void {
    onGuildMemberAdd();
    onGuildMemberRemove();
  }
}
