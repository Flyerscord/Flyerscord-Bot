import ClientManager from "../../../common/managers/ClientManager";
import IBotHealth from "../interfaces/IBotHealth";

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
