export default class HTMLPageException extends Error {
  name: string = "HTMLPageException";
  message: string = "The link is a HTML page and not an image";
}
