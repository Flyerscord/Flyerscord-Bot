import express, { Application, RequestHandler } from "express";
import Stumper from "stumper";
import { Singleton } from "../models/Singleton";
import EnvManager from "./EnvManager";

export default class ExpressManager extends Singleton {
  private app: Application;
  private port: string | number;

  constructor() {
    super();
    this.app = express();
    this.port = EnvManager.getInstance().getVar("PORT") || "3000";

    this.app.listen(parseInt(this.port), () => {
      Stumper.info(`Express server is running on port ${this.port}`, "common:ExpressManager:ExpressManager");
    });
  }

  addMiddleware(middleware: RequestHandler, path?: string): void {
    Stumper.debug(`Adding middleware`, "common:ExpressManager:addMiddleware");
    if (path) {
      this.app.use(path, middleware);
    } else {
      this.app.use(middleware);
    }
  }

  addRoute(route: string, callback: RequestHandler): void {
    Stumper.debug(`Adding route: ${route}`, "common:ExpressManager:addRoute");
    this.app.get(route, callback);
  }
}
