import { IKeyedObject } from "@common/interfaces/IKeyedObject";
import Module from "@common/models/Module";
import SlashCommand from "@common/models/SlashCommand";
import TextCommand from "@common/models/TextCommand";
import onMessageCreate from "./listeners/onMessageCreate";
import Imgur from "./utils/ImageKit";
import schema from "./db/schema";

export default class CustomCommandsModule extends Module<ICustomCommandsConfig> {
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

  getDefaultConfig(): ICustomCommandsConfig {
    return {
      prefix: "!",
      commandTempChannelId: "",
      customCommandListChannelId: "",
      imageKit: {
        publicKey: "",
        privateKey: "",
        urlEndpoint: "",
        redirectUrl: "",
        proxyUrl: "",
      },
      imgur: {
        clientId: "",
        clientSecret: "",
      },
    };
  }

  private registerListeners(): void {
    onMessageCreate();
  }
}

export interface ICustomCommandsConfig {
  prefix: string;
  commandTempChannelId: string;
  customCommandListChannelId: string;
  imageKit: ICustomCommandsImageKitConfig;
  imgur: ICustomCommandsImgurConfig;
}

interface ICustomCommandsImageKitConfig {
  publicKey: string;
  privateKey: string;
  urlEndpoint: string;
  redirectUrl: string;
  proxyUrl: string;
}

interface ICustomCommandsImgurConfig {
  clientId: string;
  clientSecret: string;
}
