import Module, { IModuleConfigSchema } from "@common/models/Module";

import IBotHealth from "./interfaces/IBotHealth";
import { getBotHealth } from "./utils/healthCheck";
import ExpressManager from "@common/managers/ExpressManager";
import { IKeyedObject } from "@common/interfaces/IKeyedObject";

export type HealthCheckConfigKeys = "";

export const healthCheckConfigSchema = [] as const satisfies readonly IModuleConfigSchema<HealthCheckConfigKeys>[];

export default class HealthCheckModule extends Module<HealthCheckConfigKeys> {
  constructor(config: IKeyedObject) {
    super("HealthCheck", config);
  }

  protected async setup(): Promise<void> {
    const expressManager = ExpressManager.getInstance();

    expressManager.addRoute("/health", (req, res) => {
      const health: IBotHealth = getBotHealth();
      if (health.status === "healthy") {
        res.status(200).json(health);
      } else {
        res.status(503).json(health);
      }
    });
  }

  protected async cleanup(): Promise<void> {
    // Nothing to cleanup
  }

  getConfigSchema(): IModuleConfigSchema<HealthCheckConfigKeys>[] {
    return [...healthCheckConfigSchema];
  }
}
