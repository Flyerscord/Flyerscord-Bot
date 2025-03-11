import ExpressManager from "../../common/managers/ExpressManager";
import Module from "../../common/models/Module";
import request from "request";
import CustomCommandsModule from "../customCommands/CustomCommandsModule";
import { IKeyedObject } from "../../common/interfaces/IKeyedObject";

export default class ImageProxyModule extends Module<IImageProxyConfig> {
  constructor(config: IKeyedObject) {
    super("ImageProxy", config);
  }

  protected async setup(): Promise<void> {
    const expressManager = ExpressManager.getInstance();

    expressManager.addRoute("/proxy/:imageId.gif", (req, res) => {
      const imageId = req.params.imageId;
      const imageUrl = `${CustomCommandsModule.getInstance().config.imageKit.urlEndpoint}/${imageId}`;

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
