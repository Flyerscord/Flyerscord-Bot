import Module, { IModuleConfigSchema } from "@common/models/Module";
import Zod from "@common/utils/ZodWrapper";
import schema from "./db/schema";
import AnonymousTipsDB from "./db/AnonymousTipsDB";
import onReady from "./listeners/onReady";

export const anonymousTipsConfigSchema = [
  {
    key: "notificationChannelId",
    description: "The ID of the channel to send notifications to",
    required: true,
    secret: false,
    requiresRestart: false,
    defaultValue: "",
    schema: Zod.string(),
  },
  {
    key: "starterChannelId",
    description: "The ID of the channel to send the tips starter message to",
    required: true,
    secret: false,
    requiresRestart: true,
    defaultValue: "",
    schema: Zod.string(),
  },
] as const satisfies readonly IModuleConfigSchema[];

export default class AnonymousTipsModule extends Module {
  protected readonly CONFIG_SCHEMA = anonymousTipsConfigSchema;

  constructor() {
    super("AnonymousTips", { schema });
  }

  protected async setup(): Promise<void> {
    const db = new AnonymousTipsDB();
    await db.setupDBState();

    registerListeners();
  }

  protected async cleanup(): Promise<void> {}
}

function registerListeners(): void {
  onReady();
}
