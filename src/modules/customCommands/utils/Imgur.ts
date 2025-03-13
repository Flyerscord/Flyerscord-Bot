import ImgurClient from "imgur";
import Stumper from "stumper";
import { Singleton } from "../../../common/models/Singleton";
import CustomCommandsModule from "../CustomCommandsModule";

export default class Imgur extends Singleton {
  private clientId: string;
  private clientSecret: string;

  private client: ImgurClient;

  constructor() {
    super();
    this.clientId = CustomCommandsModule.getInstance().config.imgur.clientId;
    this.clientSecret = CustomCommandsModule.getInstance().config.imgur.clientSecret;

    this.client = new ImgurClient({ clientId: this.clientId, clientSecret: this.clientSecret });
  }

  async getImageUrlForImgurUrl(url: string): Promise<string | undefined> {
    const imageType = await this.getImageType(url);
    switch (imageType) {
      case "image/jpeg":
        return this.convertImgurUrlToImageUrl(url, "jpg");
      case "image/png":
        return this.convertImgurUrlToImageUrl(url, "png");
      case "image/gif":
        return this.convertImgurUrlToImageUrl(url, "gif");
      case "image/apng":
        return this.convertImgurUrlToImageUrl(url, "png");
      case "image/tiff":
        return this.convertImgurUrlToImageUrl(url, "tiff");
      case "application/pdf":
        return this.convertImgurUrlToImageUrl(url, "pdf");
      default:
        Stumper.error(`Image type ${imageType} not supported`, "customCommands:Imgur:getImageUrlForImgurUrl");
        return undefined;
    }
  }

  private convertImgurUrlToImageUrl(url: string, fileEnding: string): string {
    const hash = this.getHashFromUrl(url);
    return `https://i.imgur.com/${hash}.${fileEnding}`;
  }

  private async getImageType(url: string): Promise<string | undefined> {
    const hash = this.getHashFromUrl(url);
    if (!hash) {
      Stumper.error(`Error getting hash from url: ${url}`, "customCommands:Imgur:getImageType");
      return undefined;
    }

    const imageData = await this.client.getImage(hash);

    if (imageData.success) {
      Stumper.debug(`Image ${url} has the type: ${imageData.data.type}`, "customCommands:Imgur:getImageType");
      return imageData.data.type;
    }
    Stumper.error(`Error getting image type for image ${url}`, "customCommands:Imgur:getImageType");
    return undefined;
  }

  private getHashFromUrl(url: string): string | undefined {
    const hashRegex1 = /^https?:\/\/imgur.com\/([a-zA-Z0-9]+)$/;
    const hashRegex2 = /^https?:\/\/i.imgur.com\/([a-zA-Z0-9]+)\.[a-z]+$/;
    const match1 = url.match(hashRegex1);

    if (match1) {
      return match1[1];
    }

    const match2 = url.match(hashRegex2);
    if (match2) {
      return match2[1];
    }

    return undefined;
  }
}
