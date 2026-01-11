import ExpressManager from "@common/managers/ExpressManager";
import Module, { IModuleConfigSchema } from "@common/models/Module";
import request from "request";
import ConfigManager from "@common/managers/ConfigManager";

export type ImageProxyConfigKeys = "";

export const imageProxyConfigSchema = [] as const satisfies readonly IModuleConfigSchema<ImageProxyConfigKeys>[];

export default class ImageProxyModule extends Module<ImageProxyConfigKeys> {
  constructor() {
    super("ImageProxy", { dependsOn: ["CustomCommands"], prodOnly: true, loadPriority: 11 });
  }

  protected async setup(): Promise<void> {
    const expressManager = ExpressManager.getInstance();

    expressManager.addRoute("/proxy/:imageId.gif", (req, res) => {
      const imageId = req.params.imageId;
      const imageUrl = `${ConfigManager.getInstance().getConfig("CustomCommands")["imageKit.urlEndpoint"]}/${imageId}`;

      request({ url: imageUrl, headers: { "Content-Type": "image/gif" } }).pipe(res);
    });
  }

  protected async cleanup(): Promise<void> {}

  getConfigSchema(): IModuleConfigSchema<ImageProxyConfigKeys>[] {
    return [...imageProxyConfigSchema];
  }
}
