import ClientManager from "../../../common/managers/ClientManager";
import { createBagRoleMessageIfNeeded } from "../utils/utils";

export default (): void => {
  const client = ClientManager.getInstance().client;
  client.on("ready", async () => {
    await createBagRoleMessageIfNeeded();
  });
};
