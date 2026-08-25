import Module, { IModuleConfigSchema } from "@common/models/Module";
import SlashCommand from "@common/models/SlashCommand";
import ButtonHandler from "@common/models/ButtonHandler";
import ModalMenu from "@common/models/ModalMenu";
import Zod from "@common/utils/ZodWrapper";
import schema from "./db/schema";
import onReady from "./listeners/onReady";

export type TicketsConfigKeys = "tip.reviewChannelId" | "tip.buttonChannelId";

export const ticketsConfigSchema = [
  {
    key: "tip.reviewChannelId",
    description: "Channel where anonymous tip tickets are posted for staff review",
    required: true,
    secret: false,
    requiresRestart: false,
    defaultValue: "",
    schema: Zod.string(),
  },
  {
    key: "tip.buttonChannelId",
    description: "Channel where the 'Submit a Tip' button message is posted",
    required: true,
    secret: false,
    requiresRestart: false,
    defaultValue: "",
    schema: Zod.string(),
  },
] as const satisfies readonly IModuleConfigSchema[];

export default class TicketsModule extends Module {
  protected readonly CONFIG_SCHEMA = ticketsConfigSchema;

  constructor() {
    super("Tickets", { schema });
  }

  protected async setup(): Promise<void> {
    await this.readInCommands<SlashCommand>(__dirname, "slash");
    await this.readInCommands<ButtonHandler>(__dirname, "buttons");
    await this.readInCommands<ModalMenu>(__dirname, "modals");

    this.registerListeners();
  }

  protected async cleanup(): Promise<void> {}

  private registerListeners(): void {
    onReady();
  }
}
