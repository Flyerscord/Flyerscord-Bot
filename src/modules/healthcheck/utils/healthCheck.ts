import BotHealthManager from "../../../common/managers/BotHealthManager";
import ClientManager from "../../../common/managers/ClientManager";
import IBotHealth from "../interfaces/IBotHealth";

export function getBotHealth(): IBotHealth {
  const client = ClientManager.getInstance().client;

  const healthManager = BotHealthManager.getInstance();
  if (client.isReady() && healthManager.isHealthy()) {
    return {
      status: "healthy",
      message: "Bot is connected to Discord",
      uptime: process.uptime(),
      botUptime: client.uptime,
    };
  } else {
    return {
      status: "unhealthy",
      message: "Bot is not connected to Discord or did not start up correctly",
    };
  }
}
