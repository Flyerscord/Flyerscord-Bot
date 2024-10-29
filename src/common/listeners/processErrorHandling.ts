import Stumper from "stumper";

export default (): void => {
  // Process UnhandledRejection
  process.on("unhandledRejection", function (err, p) {
    Stumper.error(err, "Unhandled Exception");
    Stumper.error(p, "Unhandled Exception");
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
