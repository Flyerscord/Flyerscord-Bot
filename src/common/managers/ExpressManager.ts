import express, { Application, RequestHandler } from "express";
import Stumper from "stumper";
import { Singleton } from "../models/Singleton";
import Env from "../utils/Env";

export default class ExpressManager extends Singleton {
  private app: Application;
  private port: string | number;

  constructor() {
    super();
    this.app = express();
    this.port = Env.get("PORT") || "3000";

    this.app.listen(parseInt(this.port), () => {
      Stumper.info(`Express server is running on port ${this.port}`, "common:ExpressManager:ExpressManager");
    });
  }

  addRoute(route: string, callback: RequestHandler): void {
    Stumper.debug(`Adding route: ${route}`, "common:ExpressManager:addRoute");
    this.app.get(route, callback);
  }
}
