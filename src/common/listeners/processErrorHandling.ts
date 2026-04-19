import Stumper from "stumper";
import ModuleManager from "../managers/ModuleManager";
import Database from "../db/db";

export default (): void => {
  // Process UnhandledRejection
  process.on("unhandledRejection", function (err, p) {
    // eslint-disable-next-line local/stumper-tag-format
    Stumper.caughtError(err, "Unhandled Exception");
    // eslint-disable-next-line local/stumper-tag-format
    Stumper.error(p, "Unhandled Exception");
  });

  // Process UncaughtException
  process.on("uncaughtException", async function (err) {
    Stumper.caughtError(err, "common:processErrorHandling:onUncaughtException");

    const result = await ModuleManager.getInstance().disableAllModules();
    if (result) {
      Stumper.success("Successfully disabled all modules!", "common:processErrorHandling:onUncaughtException");
    } else {
      Stumper.warning("Failed to disable all modules! Check the logs above for more details.", "common:processErrorHandling:onUncaughtException");
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
    Stumper.caughtWarning(warning, "common:processErrorHandling:onWarning");
  });
};
