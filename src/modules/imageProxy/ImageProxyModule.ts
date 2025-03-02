import Config from "../../common/config/Config";
import ExpressManager from "../../common/managers/ExpressManager";
import Module from "../../common/models/Module";
import request from "request";

export default class ImageProxyModule extends Module<IImageProxyConfig> {
  constructor(config: IImageProxyConfig) {
    super("ImageProxy", config);
  }

  protected async setup(): Promise<void> {
    const expressManager = ExpressManager.getInstance();

    expressManager.addRoute("/proxy/:imageId.gif", (req, res) => {
      const imageId = req.params.imageId;
      const imageUrl = `${Config.getConfig().imageKit.urlEndpoint}/${imageId}`;

      request({ url: imageUrl, headers: { "Content-Type": "image/gif" } }).pipe(res);
    });
  }

  protected async cleanup(): Promise<void> {
    // Nothing to cleanup
  }

  protected getDefaultConfig(): IImageProxyConfig {
    return {};
  }
}

export interface IImageProxyConfig {}
