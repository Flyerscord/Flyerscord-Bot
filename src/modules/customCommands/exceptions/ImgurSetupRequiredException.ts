export class ImgurSetupRequiredException extends Error {
  public name: string = "ImgurSetupRequired";
  public message: string = "You need to setup the Imgur client ID before use!";
}
