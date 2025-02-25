import Stumper from "stumper";
import ModuleManager from "../managers/ModuleManager";

export default (): void => {
  process.on("SIGINT", () => {
    Stumper.warning("Received SIGINT signal, shutting down...", "common:onSigInt");
    ModuleManager.getInstance().disableAllModules();

    process.exit(0);
  });
};
