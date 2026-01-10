import { IKeyedObject } from "@common/interfaces/IKeyedObject";
import Module, { IModuleConfigSchema } from "@common/models/Module";
import onGuildMemberAdd from "./listeners/onGuildMemberAdd";
import onGuildMemberRemove from "./listeners/onGuildMemberRemove";
import Zod from "@common/utils/ZodWrapper";

export type JoinLeaveConfigKeys = "channelId";

export default class JoinLeaveModule extends Module<JoinLeaveConfigKeys> {
  constructor(config: IKeyedObject) {
    super("JoinLeave", config);
  }

  protected async setup(): Promise<void> {
    this.registerListeners();
  }

  protected async cleanup(): Promise<void> {
    // Nothing to cleanup
  }

  protected getConfigSchema(): IModuleConfigSchema<JoinLeaveConfigKeys>[] {
    return [
      {
        key: "channelId",
        description: "The channel ID of the channel to send join/leave messages to",
        required: true,
        secret: false,
        requiresRestart: false,
        defaultValue: "",
        schema: Zod.string(),
      },
    ];
  }

  private registerListeners(): void {
    onGuildMemberAdd();
    onGuildMemberRemove();
  }
}
