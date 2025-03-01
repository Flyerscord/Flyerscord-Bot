import Module from "../../common/models/Module";
import SlashCommand from "../../common/models/SlashCommand";
import TextCommand from "../../common/models/TextCommand";
import onAutocomplete from "./listeners/onAutocomplete";
import onMessageCreate from "./listeners/onMessageCreate";
import CustomCommandsDB from "./providers/CustomCommands.Database";
import Imgur from "./utils/ImageKit";

export default class CustomCommandsModule extends Module<ICustomCommandsConfig> {
  constructor() {
    super("CustomCommands");
  }

  protected async setup(): Promise<void> {
    await this.readInCommands<SlashCommand>(__dirname, "slash");
    await this.readInCommands<TextCommand>(__dirname, "text");

    this.registerListeners();

    Imgur.getInstance();
  }

  protected async cleanup(): Promise<void> {
    CustomCommandsDB.getInstance().close();
  }

  getDefaultConfig(): ICustomCommandsConfig {
    return {
      prefix: ".",
      commandTempChannelId: "",
      customCommandListChannelId: "",
      imageKit: {
        publicKey: "",
        privateKey: "",
        urlEndpoint: "",
        redirectUrl: "",
      },
      imgur: {
        clientId: "",
        clientSecret: "",
      },
    };
  }

  private registerListeners(): void {
    onMessageCreate();
    onAutocomplete();
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
}

interface ICustomCommandsImgurConfig {
  clientId: string;
  clientSecret: string;
}
