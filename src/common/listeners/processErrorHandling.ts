import Stumper from "stumper";
import { closeAllDbConnections } from "../utils/cleanup";

export default (): void => {
  // Process UnhandledRejection
  process.on("unhandledRejection", function (err, p) {
    Stumper.caughtError(err, "Unhandled Exception");
    Stumper.error(p, "Unhandled Exception");
  });

  // Process UncaughtException
  process.on("uncaughtException", function (err) {
    Stumper.caughtError(err, "Uncaught Exception");

    closeAllDbConnections();

    process.exit(1);
  });

  // Process Warning
  process.removeAllListeners("warning");
  process.on("warning", (warning) => {
    // Ignore warning about buffer.File
    if (warning.name === "ExperimentalWarning" && warning.message.includes("buffer.File")) {
      return;
    }
    Stumper.warning(warning.message, warning.name);
    Stumper.warning(warning.stack, warning.name);
  });
};
