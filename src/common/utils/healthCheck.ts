import IBotHealth from "../interfaces/IBotHealth.js";
import ClientManager from "../managers/ClientManager.js";

export function getBotHealth(): IBotHealth {
  const client = ClientManager.getInstance().client;
  if (client.isReady()) {
    return {
      status: "healthy",
      message: "Bot is connected to Discord",
      uptime: process.uptime(),
      botUptime: client.uptime,
    };
  } else {
    return {
      status: "unhealthy",
      message: "Bot is not connected to Discord",
    };
  }
}
