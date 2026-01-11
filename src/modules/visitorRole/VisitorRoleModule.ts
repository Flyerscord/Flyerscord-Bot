import Module, { IModuleConfigSchema } from "@common/models/Module";
import onGuildMemberAdd from "./listeners/onGuildMemberAdd";
import onMessageReactionAdd from "./listeners/onMessageReactionAdd";
import onMessageReactionRemove from "./listeners/onMessageReactionRemove";
import onReady from "./listeners/onReady";
import schema from "./db/schema";
import Zod from "@common/utils/ZodWrapper";

export type VisitorRoleConfigKeys = "memberRoleId" | "visitorRoleId" | "visitorEmojiId" | "rolesChannelId";

export const visitorRoleConfigSchema = [
  {
    key: "memberRoleId",
    description: "The role ID of the member role",
    required: true,
    secret: false,
    requiresRestart: true,
    defaultValue: "",
    schema: Zod.string(),
  },
  {
    key: "visitorRoleId",
    description: "The role ID of the visitor role",
    required: true,
    secret: false,
    requiresRestart: true,
    defaultValue: "",
    schema: Zod.string(),
  },
  {
    key: "visitorEmojiId",
    description: "The emoji ID of the visitor emoji",
    required: true,
    secret: false,
    requiresRestart: true,
    defaultValue: "",
    schema: Zod.string(),
  },
  {
    key: "rolesChannelId",
    description: "The channel ID of the roles channel",
    required: true,
    secret: false,
    requiresRestart: true,
    defaultValue: "",
    schema: Zod.string(),
  },
] as const satisfies readonly IModuleConfigSchema<VisitorRoleConfigKeys>[];

export default class VistorRoleModule extends Module<VisitorRoleConfigKeys> {
  constructor() {
    super("VisitorRole", { schema });
  }

  protected async setup(): Promise<void> {
    this.registerListeners();
  }

  protected async cleanup(): Promise<void> {}

  getConfigSchema(): IModuleConfigSchema<VisitorRoleConfigKeys>[] {
    return [...visitorRoleConfigSchema];
  }

  private registerListeners(): void {
    onGuildMemberAdd();
    onMessageReactionAdd();
    onMessageReactionRemove();
    onReady();
  }
}
