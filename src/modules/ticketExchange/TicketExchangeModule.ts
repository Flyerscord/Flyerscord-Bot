import Module, { IModuleConfigSchema } from "@common/models/Module";
import Zod from "@common/utils/ZodWrapper";
import { z } from "zod";
import schema from "./db/schema";
import TicketExchangeDB from "./db/TicketExchangeDB";
import onReady from "./listeners/onReady";
import onInteractionCreate from "./listeners/onInteractionCreate";

export const ticketExchangeConfigSchema = [
  {
    key: "forumId",
    description: "The ID of the forum to use for ticket exchange",
    required: true,
    secret: false,
    requiresRestart: true,
    defaultValue: "",
    schema: Zod.string(),
  },
  {
    key: "startPostMessage",
    description: "The message to send when the bot is first added to a server. Will be updated on bot restart.",
    required: true,
    defaultValue: "",
    requiresRestart: true,
    secret: false,
    schema: Zod.string(),
  },
  {
    key: "privateThreadChannelId",
    description: "The channel ID of the channel to use for private threads",
    required: true,
    secret: false,
    requiresRestart: true,
    defaultValue: "",
    schema: Zod.string(),
  },
  {
    key: "verifiedSTHRoleId",
    description: "The role ID for the verified STH role",
    required: true,
    secret: false,
    requiresRestart: false,
    defaultValue: "",
    schema: Zod.string(),
  },
  {
    key: "verifiedSellerRoleId",
    description: "The role ID for the verified seller role",
    required: true,
    secret: false,
    requiresRestart: false,
    defaultValue: "",
    schema: Zod.string(),
  },
  {
    key: "newPostNotificationRoleId",
    description: "The role ID for the new post notification role",
    required: true,
    secret: false,
    requiresRestart: false,
    defaultValue: "",
    schema: Zod.string(),
  },
  {
    key: "verifierRoleId",
    description: "The role ID for the verifier role",
    required: true,
    secret: false,
    requiresRestart: false,
    defaultValue: "",
    schema: Zod.string(),
  },
  {
    key: "sthVerificationStartMessage",
    description: "The message that a STH Verification thread will start with",
    required: true,
    secret: false,
    requiresRestart: false,
    defaultValue: "",
    schema: Zod.string(),
  },
] as const satisfies readonly IModuleConfigSchema[];

export default class TicketExchangeModule extends Module {
  protected readonly CONFIG_SCHEMA = ticketExchangeConfigSchema;

  constructor() {
    super("TicketExchange", { schema });
  }

  protected async setup(): Promise<void> {
    const db = new TicketExchangeDB();
    await db.setupTicketExchangeState();

    this.registerListeners();
  }

  protected async cleanup(): Promise<void> {}

  private registerListeners(): void {
    onReady();
    onInteractionCreate();
  }
}
