import ClientManager from "@common/managers/ClientManager";
import { createRoleReactionMessagesIfNeeded } from "../utils/utils";

export default (): void => {
  const client = ClientManager.getInstance().client;
  client.on("clientReady", async () => {
    await createRoleReactionMessagesIfNeeded();
  });
};
