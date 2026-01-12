import Stumper from "stumper";
import ModuleManager from "../managers/ModuleManager";
import Database from "../db/db";

export default (): void => {
  // Process UnhandledRejection
  process.on("unhandledRejection", function (err, p) {
    Stumper.caughtError(err, "Unhandled Exception");
    Stumper.error(p, "Unhandled Exception");
  });

  // Process UncaughtException
  process.on("uncaughtException", async function (err) {
    Stumper.caughtError(err, "Uncaught Exception");

    const result = await ModuleManager.getInstance().disableAllModules();
    if (result) {
      Stumper.success("Successfully disabled all modules!", "common:processErrorHandling");
    } else {
      Stumper.warning("Failed to disable all modules! Check the logs above for more details.", "common:processErrorHandling");
    }

    await Database.getInstance().closeDb();
    process.exit(1);
  });

  // Process Warning
  process.removeAllListeners("warning");
  process.on("warning", (warning) => {
    // Ignore warning about buffer.File
    if (warning.name === "ExperimentalWarning" && warning.message.includes("buffer.File")) {
      return;
    }
    Stumper.caughtWarning(warning, "Unhandled Warning");
  });
};
