import Stumper from "stumper";

export default (): void => {
  // Process UnhandledRejection
  process.on("unhandledRejection", function (err, p) {
    Stumper.error(err, "Unhandled Exception");
    Stumper.error(p, "Unhandled Exception");
  });

  // Process Warning
  process.on("warning", (warning) => {
    Stumper.warning(warning.message, warning.name);
    Stumper.warning(warning.stack, warning.name);
  });
};
