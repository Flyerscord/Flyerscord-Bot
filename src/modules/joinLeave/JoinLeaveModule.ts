import Module, { IModuleConfigSchema } from "@common/models/Module";
import onGuildMemberAdd from "./listeners/onGuildMemberAdd";
import onGuildMemberRemove from "./listeners/onGuildMemberRemove";
import Zod from "@common/utils/ZodWrapper";
import { z } from "zod";
import schema from "./db/schema";

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
  {
    key: "notVerifiedRoleId",
    description: "The role ID of the role that users that have not verified are given",
    required: true,
    secret: false,
    requiresRestart: false,
    defaultValue: "",
    schema: Zod.string(),
  },
  {
    key: "captchaQuestions",
    description: "The captcha questions to ask users",
    required: true,
    secret: false,
    requiresRestart: false,
    defaultValue: [],
    schema: z.array(z.object({ question: z.string(), answer: z.string() })),
  },
  // Might be useful later, we will see if the captcha stops spam bots
  // {
  //   key: "brandNewAccountThreshold",
  //   description: "The number of days old a user's account must be older than to be not considered brand new",
  //   required: false,
  //   secret: false,
  //   requiresRestart: false,
  //   defaultValue: 3,
  //   schema: Zod.number({ min: 1, max: 365 }),
  // },
  // {
  //   key: "brandNewAccountTimeoutLength",
  //   description: "The number of days a user's account is timed out for being brand new",
  //   required: false,
  //   secret: false,
  //   requiresRestart: false,
  //   defaultValue: 3,
  //   schema: Zod.number({ min: 1, max: 365 }),
  // },
] as const satisfies readonly IModuleConfigSchema[];

export default class JoinLeaveModule extends Module {
  protected readonly CONFIG_SCHEMA = joinLeaveConfigSchema;

  constructor() {
    super("JoinLeave", { schema });
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
