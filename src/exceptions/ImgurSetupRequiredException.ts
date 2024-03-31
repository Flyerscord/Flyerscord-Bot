import Exception from "../models/Exception";

export class ImgurSetupRequiredException extends Exception {
  constructor() {
    super("ImgurSetupRequired", "You need to setup the Imgur client ID before use!");
  }
}
