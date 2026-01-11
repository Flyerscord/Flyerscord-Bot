import Stumper from "stumper";
import ModuleManager from "../managers/ModuleManager";
import Database from "../db/db";

export default (): void => {
  process.on("SIGINT", async () => {
    Stumper.warning("Received SIGINT signal, shutting down...", "common:onSigInt");

    const result = await ModuleManager.getInstance().disableAllModules();
    if (result) {
      Stumper.success("Successfully disabled all modules!", "common:onSigInt");
    } else {
      Stumper.warning("Failed to disable all modules! Check the logs above for more details.", "common:onSigInt");
    }

    await Database.getInstance().closeDb();

    process.exit(0);
  });
};
