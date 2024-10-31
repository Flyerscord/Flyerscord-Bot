export default class PageNotFoundException extends Error {
  name: string = "PageNotFoundException";
  message: string = "Page not found";
}
