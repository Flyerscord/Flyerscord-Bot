import Module from "../../common/models/Module";

import express from "express";
import IBotHealth from "./interfaces/IBotHealth";
import { getBotHealth } from "./utils/healthCheck";
import Stumper from "stumper";

export default class HealthCheckModule extends Module {
  constructor() {
    super("HealthCheck");
  }

  protected override async setup(): Promise<void> {
    const app = express();
    const port = process.env.PORT || 3000;

    app.get("/health", (req, res) => {
      const health: IBotHealth = getBotHealth();
      if (health.status === "healthy") {
        res.status(200).json(health);
      } else {
        res.status(503).json(health);
      }
    });

    app.listen(port, () => {
      Stumper.info(`Health check server is running on port ${port}`, "healthCheck:HealthCheckModule:setup");
    });
  }
}
