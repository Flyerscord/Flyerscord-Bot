import Module, { IModuleConfigSchema } from "@common/models/Module";
import onGuildMemberAdd from "./listeners/onGuildMemberAdd";
import onGuildMemberRemove from "./listeners/onGuildMemberRemove";
import Zod from "@common/utils/ZodWrapper";
import { z } from "zod";
import schema from "./db/schema";
import onMessageCreate from "./listeners/onMessageCreate";
import SlashCommand from "@common/models/SlashCommand";
import KickNotVerifiedTask from "./tasks/KickNotVerifiedTask";

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
  {
    key: "maxAnswerLength",
    description: "The threshold of answer lengths to allow the user to reply with",
    required: false,
    secret: false,
    requiresRestart: false,
    defaultValue: 75,
    schema: Zod.number({ min: 1, max: 1000 }),
  },
  {
    key: "maxIncorrectAnswers",
    description: "The maximum number of incorrect answers allowed before the user is locked",
    required: false,
    secret: false,
    requiresRestart: false,
    defaultValue: 3,
    schema: Zod.number({ min: 1, max: 1000 }),
  },
  {
    key: "incorrectAnswersTimeout",
    description: "The number of seconds a user is locked for after reaching the max incorrect answers",
    required: false,
    secret: false,
    requiresRestart: false,
    defaultValue: 3600,
    schema: Zod.number({ min: 1, max: 2_592_000 }),
  },
  {
    key: "maxTimeOuts",
    description: "The maximum number of timeouts a user can have before being banned",
    required: false,
    secret: false,
    requiresRestart: false,
    defaultValue: 2,
    schema: Zod.number({ min: 1, max: 1000 }),
  },
  {
    key: "kickNotVerifiedPeriod",
    description: "The period in days to wait before kicking a user who has not verified",
    required: false,
    secret: false,
    requiresRestart: false,
    defaultValue: 7,
    schema: Zod.number({ min: 1, max: 365 }),
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
    await this.readInCommands<SlashCommand>(__dirname, "slash");

    this.registerListeners();
    this.registerSchedules();
  }

  protected async cleanup(): Promise<void> {}

  private registerListeners(): void {
    onGuildMemberAdd();
    onGuildMemberRemove();
    onMessageCreate();
  }

  private registerSchedules(): void {
    KickNotVerifiedTask.getInstance().createScheduledJob();
  }
}
