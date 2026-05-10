import ClientManager from "@common/managers/ClientManager";
import { sendOrUpdateIntroMessage } from "../utils/introMessage";

export default (): void => {
  const client = ClientManager.getInstance().client;
  client.on("clientReady", async () => {
    await sendOrUpdateIntroMessage();
  });
};
