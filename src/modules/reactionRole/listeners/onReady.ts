import ClientManager from "../../../common/managers/ClientManager";
import { createBagRoleMessageIfNeeded } from "../../bagReactionRole/utils/utils";

export default (): void => {
  const client = ClientManager.getInstance().client;
  client.on("ready", async () => {
    await createBagRoleMessageIfNeeded();
  });
};
