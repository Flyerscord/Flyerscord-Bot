import { setMessageIdsFromConfig } from "./utils/utils";
import onReady from "./listeners/onReady";
import onMessageReactionAdd from "./listeners/onMessageReactionAdd";
import onMessageReactionRemove from "./listeners/onMessageReactionRemove";
import Module, { IModuleConfigSchema } from "@common/models/Module";
import schema from "./db/schema";
import Zod from "@common/utils/ZodWrapper";
import { z } from "zod";

export type ReactionRoleConfigKeys = "channelId" | "reactionRoles";

export const reactionRoleConfigSchema = [
  {
    key: "channelId",
    description: "The channel ID of the channel to send reaction role messages to",
    required: true,
    secret: false,
    requiresRestart: true,
    defaultValue: "",
    schema: Zod.string(),
  },
  {
    key: "reactionRoles",
    description: "The reaction roles to create",
    required: true,
    secret: false,
    requiresRestart: true,
    defaultValue: [],
    schema: z.array(
      z.object({
        name: Zod.string(),
        description: Zod.string(),
        colorHex: z.string().regex(/^#[0-9A-Fa-f]{6}$/),
        roleId: Zod.string(),
        emojiId: Zod.string(),
        messageId: Zod.string().optional(),
      }),
    ),
  },
] as const satisfies readonly IModuleConfigSchema<ReactionRoleConfigKeys>[];

export type ReactionRolesConfig = z.infer<(typeof reactionRoleConfigSchema)[1]["schema"]>[number];

export default class ReactionRoleModule extends Module<ReactionRoleConfigKeys> {
  constructor() {
    super("ReactionRole", { schema });
  }

  protected async setup(): Promise<void> {
    await setMessageIdsFromConfig();

    this.registerListeners();
  }

  protected async cleanup(): Promise<void> {}

  getConfigSchema(): IModuleConfigSchema<ReactionRoleConfigKeys>[] {
    return [...reactionRoleConfigSchema];
  }

  private registerListeners(): void {
    onMessageReactionAdd();
    onMessageReactionRemove();
    onReady();
  }
}
