import ImageKit from "imagekit";
import Config from "../../../common/config/Config";
import Stumper from "stumper";
import { UploadResponse } from "imagekit/dist/libs/interfaces/UploadResponse";
import IKResponse from "imagekit/dist/libs/interfaces/IKResponse";

export default class MyImageKit {
  private static instance: MyImageKit;

  private client: ImageKit;

  private publickey: string;
  private privatekey: string;
  private urlEndpoint: string;
  private redirectUrl: string;

  private constructor() {
    this.publickey = Config.getConfig().imageKit.publicKey;
    this.privatekey = Config.getConfig().imageKit.privateKey;
    this.urlEndpoint = Config.getConfig().imageKit.urlEndpoint;
    this.redirectUrl = Config.getConfig().imageKit.redirectUrl;

    this.client = new ImageKit({
      publicKey: this.publickey,
      privateKey: this.privatekey,
      urlEndpoint: this.urlEndpoint,
    });
  }

  static getInstance(): MyImageKit {
    return this.instance || (this.instance = new this());
  }

  async uploadImage(url: string, fileName: string, addedBy: string, command: string): Promise<string | undefined> {
    const response: IKResponse<UploadResponse> = await this.client.upload({
      file: url,
      fileName: fileName,
      useUniqueFileName: true,
      tags: ["flyerscord", "custom-command"],
      customMetadata: { addedBy: addedBy, command: command },
    });

    if (response.$ResponseMetadata.statusCode == 200) {
      const imageUrl = response.url;
      const redirectedImageUrl = this.replaceEndpointWithRedirectUrl(imageUrl);
      Stumper.info(`Successfully uploaded image to ImageKit: ${imageUrl}`, "customCommands:ImageKit:uploadImage");
      return redirectedImageUrl;
    } else {
      Stumper.error(`Error uploading image to ImageKit: ${response.$ResponseMetadata.statusCode}`, "customCommands:ImageKit:uploadImage");
      return undefined;
    }
  }

  private replaceEndpointWithRedirectUrl(url: string): string {
    return url.replace(this.urlEndpoint, this.redirectUrl);
  }
}
