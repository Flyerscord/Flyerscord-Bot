export class ImgurSetupRequiredException extends Error {
  name: string = "ImgurSetupRequired";
  message: string = "You need to setup the Imgur client ID before use!";
}
