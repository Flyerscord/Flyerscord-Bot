import express, { Application, RequestHandler } from "express";
import Stumper from "stumper";

export default class ExpressManager {
  private static instance: ExpressManager;

  private app: Application;
  private port: string | number;

  private constructor() {
    this.app = express();
    this.port = process.env.PORT || "3000";

    this.app.listen(parseInt(this.port), () => {
      Stumper.info(`Express server is running on port ${this.port}`, "common:ExpressManager:ExpressManager");
    });
  }

  static getInstance(): ExpressManager {
    return this.instance || (this.instance = new this());
  }

  addRoute(route: string, callback: RequestHandler): void {
    Stumper.debug(`Adding route: ${route}`, "common:ExpressManager:addRoute");
    this.app.get(route, callback);
  }
}
