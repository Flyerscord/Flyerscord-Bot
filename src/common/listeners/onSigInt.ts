import Stumper from "stumper";
import ModuleManager from "../managers/ModuleManager";
import Database from "../db/db";

export default (): void => {
  process.on("SIGINT", async () => {
    Stumper.warning("Received SIGINT signal, shutting down...", "common:onSigInt");
    ModuleManager.getInstance().disableAllModules();

    await Database.getInstance().closeDb();

    process.exit(0);
  });
};
