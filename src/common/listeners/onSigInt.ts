import Stumper from "stumper";
import { closeAllDbConnections } from "../utils/cleanup";

export default (): void => {
  process.on("SIGINT", () => {
    Stumper.warning("Received SIGINT signal, shutting down...", "common:onSigInt");
    closeAllDbConnections();

    process.exit(0);
  });
};
