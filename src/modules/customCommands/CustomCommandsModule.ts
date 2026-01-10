import { IKeyedObject } from "@common/interfaces/IKeyedObject";
import Module, { IModuleConfigSchema } from "@common/models/Module";
import SlashCommand from "@common/models/SlashCommand";
import TextCommand from "@common/models/TextCommand";
import onMessageCreate from "./listeners/onMessageCreate";
import Imgur from "./utils/ImageKit";
import schema from "./db/schema";
import Zod from "@common/utils/ZodWrapper";

export type CustomCommandsConfigKeys =
  | "prefix"
  | "commandTempChannelId"
  | "customCommandListChannelId"
  | "imageKit.publicKey"
  | "imageKit.privateKey"
  | "imageKit.urlEndpoint"
  | "imageKit.redirectUrl"
  | "imageKit.proxyUrl"
  | "imgur.clientId"
  | "imgur.clientSecret";

export const customCommandsConfigSchema = [
  {
    key: "prefix",
    description: "The prefix for the custom commands",
    required: false,
    secret: false,
    requiresRestart: false,
    defaultValue: "!",
    schema: Zod.string({ min: 1, max: 1 }),
  },
  {
    key: "commandTempChannelId",
    description: "The channel ID of the channel to send commands to tempararily to get a new discord url",
    required: true,
    secret: false,
    requiresRestart: false,
    defaultValue: "",
    schema: Zod.string(),
  },
  {
    key: "customCommandListChannelId",
    description: "The channel ID of the channel to send the custom command list to",
    required: true,
    secret: false,
    requiresRestart: true,
    defaultValue: "",
    schema: Zod.string(),
  },
  {
    key: "imageKit.publicKey",
    description: "The public key for ImageKit",
    required: true,
    secret: true,
    requiresRestart: true,
    defaultValue: "",
    schema: Zod.encryptedString(),
  },
  {
    key: "imageKit.privateKey",
    description: "The private key for ImageKit",
    required: true,
    secret: true,
    requiresRestart: true,
    defaultValue: "",
    schema: Zod.encryptedString(),
  },
  {
    key: "imageKit.urlEndpoint",
    description: "The URL endpoint for ImageKit",
    required: true,
    secret: true,
    requiresRestart: true,
    defaultValue: "",
    schema: Zod.string(),
  },
  {
    key: "imageKit.redirectUrl",
    description: "The redirect URL for ImageKit",
    required: true,
    secret: true,
    requiresRestart: true,
    defaultValue: "",
    schema: Zod.string(),
  },
  {
    key: "imageKit.proxyUrl",
    description: "The proxy URL for ImageKit",
    required: true,
    secret: true,
    requiresRestart: true,
    defaultValue: "",
    schema: Zod.string(),
  },
  {
    key: "imgur.clientId",
    description: "The client ID for Imgur",
    required: true,
    secret: true,
    requiresRestart: true,
    defaultValue: "",
    schema: Zod.encryptedString(),
  },
  {
    key: "imgur.clientSecret",
    description: "The client secret for Imgur",
    required: true,
    secret: true,
    requiresRestart: true,
    defaultValue: "",
    schema: Zod.encryptedString(),
  },
] as const satisfies readonly IModuleConfigSchema<CustomCommandsConfigKeys>[];

export default class CustomCommandsModule extends Module<CustomCommandsConfigKeys> {
  constructor(config: IKeyedObject) {
    super("CustomCommands", config, schema);
  }

  protected async setup(): Promise<void> {
    await this.readInCommands<SlashCommand>(__dirname, "slash");
    await this.readInCommands<TextCommand>(__dirname, "text");

    this.registerListeners();

    Imgur.getInstance();
  }

  protected async cleanup(): Promise<void> {}

  getConfigSchema(): IModuleConfigSchema<CustomCommandsConfigKeys>[] {
    return [...customCommandsConfigSchema];
  }

  private registerListeners(): void {
    onMessageCreate();
  }
}
