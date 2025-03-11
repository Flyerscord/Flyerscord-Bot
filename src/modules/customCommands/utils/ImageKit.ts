import ImageKit from "imagekit";
import Config from "../../../common/config/Config";
import Stumper from "stumper";
import { UploadResponse } from "imagekit/dist/libs/interfaces/UploadResponse";
import IKResponse from "imagekit/dist/libs/interfaces/IKResponse";
import { Singleton } from "../../../common/models/Singleton";

export default class MyImageKit extends Singleton {
  private client: ImageKit;

  private publickey: string;
  private privatekey: string;
  private urlEndpoint: string;
  private redirectUrl: string;

  constructor() {
    super();
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

  private async getImageMimeType(url: string): Promise<string | undefined> {
    const fileId = await this.getImageIdFromUrl(url);
    if (!fileId) {
      return undefined;
    }
    const resp = await this.client.getFileDetails(fileId);

    if (resp.$ResponseMetadata.statusCode == 200) {
      Stumper.debug(`Image type: ${resp.mime}`, "customCommands:ImageKit:getImageType");
      return resp.mime;
    } else {
      Stumper.error(`Error getting image type for image ${url}`, "customCommands:ImageKit:getImageType");
      return undefined;
    }
  }

  private async getImageIdFromUrl(url: string): Promise<string | undefined> {
    const imageFilePath = url.replace(Config.getConfig().imageKit.redirectUrl, "");
    const resp = await this.client.listFiles({});

    if (resp.$ResponseMetadata.statusCode == 200) {
      const file = resp.find((file) => file.name == imageFilePath);

      if (!file) {
        Stumper.error(`Error finding file for url: ${url}`, "customCommands:ImageKit:getImageIdFromUrl");
        return undefined;
      }

      return file.fileId;
    } else {
      Stumper.error("Error getting list of images", "customCommands:ImageKit:getImageIdFromUrl");
      return undefined;
    }
  }

  private getImagePathFromUrl(url: string): string {
    const imageFilePath = url.replace(Config.getConfig().imageKit.redirectUrl, "");
    return imageFilePath;
  }

  isImageKitUrl(text: string): boolean {
    const endpoint = Config.getConfig().imageKit.redirectUrl;
    const escapedEndpoint = endpoint.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
    const urlPattern = new RegExp(`^${escapedEndpoint}`);

    return urlPattern.test(text);
  }

  async convertToProxyUrlIfNeeded(url: string): Promise<string | undefined> {
    const animatedOrVideoMimeTypes = [
      // "video/mp4",
      "video/webm",
      "video/ogg",
      "video/quicktime",
      "video/x-msvideo",
      "video/x-flv",
      "video/mpeg",
      "video/x-matroska",
      "video/3gpp",
      "video/x-ms-wmv",
      "image/gif",
      "image/apng",
      "image/webp",
      "application/x-shockwave-flash",
    ];
    const imageType = await this.getImageMimeType(url);

    if (!imageType) {
      return undefined;
    }

    if (animatedOrVideoMimeTypes.includes(imageType)) {
      const imagePath = this.getImagePathFromUrl(url);
      if (!imagePath) {
        return undefined;
      }

      return `${Config.getConfig().imageKit.proxyUrl}${imagePath}.gif`;
    }
  }
}
