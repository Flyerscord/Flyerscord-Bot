import ExpressManager from "@common/managers/ExpressManager";
import Module, { IModuleConfigSchema } from "@common/models/Module";
import request from "request";
import { IKeyedObject } from "@common/interfaces/IKeyedObject";
import ConfigManager from "@root/src/common/managers/ConfigManager";

export type ImageProxyConfigKeys = "";

export default class ImageProxyModule extends Module<ImageProxyConfigKeys> {
  constructor(config: IKeyedObject) {
    super("ImageProxy", config, {}, ["CustomCommands"]);
  }

  protected async setup(): Promise<void> {
    const expressManager = ExpressManager.getInstance();

    expressManager.addRoute("/proxy/:imageId.gif", (req, res) => {
      const imageId = req.params.imageId;
      const imageUrl = `${ConfigManager.getInstance().getConfig("CustomCommands").imageKit.urlEndpoint}/${imageId}`;

      request({ url: imageUrl, headers: { "Content-Type": "image/gif" } }).pipe(res);
    });
  }

  protected async cleanup(): Promise<void> {}

  protected getConfigSchema(): IModuleConfigSchema<ImageProxyConfigKeys>[] {
    return [];
  }
}
