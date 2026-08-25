import ClientManager from "@common/managers/ClientManager";
import { createTipButtonMessageIfNeeded } from "../utils/ticketButtonMessage";

export default (): void => {
  const client = ClientManager.getInstance().client;
  client.on("clientReady", async () => {
    await createTipButtonMessageIfNeeded();
  });
};
