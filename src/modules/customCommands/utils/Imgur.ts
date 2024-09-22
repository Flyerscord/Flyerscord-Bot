import { ImgurClient } from "imgur";
import { ImgurSetupRequiredException } from "../exceptions/ImgurSetupRequiredException";
import Config from "../../../common/config/Config";

export default class Imgur {
  private static instance: Imgur;

  private client: ImgurClient | undefined;
  private clientId: string;

  private constructor() {
    this.clientId = Config.getConfig().imgurClientId;
  }

  static getInstance(): Imgur {
    return this.instance || (this.instance = new this());
  }

  public async uploadImage(url: string, title: string): Promise<string | undefined> {
    this.setupConnection();

    const response = await this.client!.upload({
      image: url,
      title: title,
      description: "Image for Flyers Discord Command",
    });

    if (response.success) {
      return response.data.link;
    }
    return undefined;
  }

  private setupConnection(): void {
    if (this.client == undefined) {
      if (this.clientId == "") {
        throw new ImgurSetupRequiredException();
      }
      this.client = new ImgurClient({ clientId: this.clientId });
    }
  }
}
