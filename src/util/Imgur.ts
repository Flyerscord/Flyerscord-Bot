import { ImgurClient } from "imgur";
import { ImgurSetupRequiredException } from "../exceptions/ImgurSetupRequiredException";

export default class Imgur {
  private static instance: Imgur;

  private client: ImgurClient | undefined;

  private clientID: string;
  private constructor() {
    this.clientID = "";
  }

  static getInstance(): Imgur {
    return this.instance || (this.instance = new this());
  }

  public setClientId(clientId: string): void {
    this.clientID = clientId;
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
      if (this.clientID == "") {
        throw new ImgurSetupRequiredException();
      }
      this.client = new ImgurClient({ clientId: this.clientID });
    }
  }
}
