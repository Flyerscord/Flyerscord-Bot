import Task from "@common/models/Task";

import nhlApi from "nhl-api-wrapper-ts";
import Stumper from "stumper";
import NHLDB from "../db/NHLDB";
import { GAME_TYPE } from "nhl-api-wrapper-ts/dist/interfaces/Common";
import { roleMention } from "discord.js";
import ConfigManager from "@common/managers/ConfigManager";
import discord from "@common/utils/discord/discord";

enum PeriodType {
  REG,
  OT,
  SHOOTOUT,
  PLAYOFF_OT,
}

export default class LiveDataTask extends Task {
  constructor() {
    // Run every 15 seconds
    super("PeriodNotifications", "*/15 * * * * *");
  }

  protected async execute(): Promise<void> {
    const db = new NHLDB();
    const liveData = await db.getCurrentLiveData();
    if (!liveData) {
      Stumper.error("No live data found, not running task", "nhl:LiveDataTask:execute");
      return;
    }

    const gameId = liveData.gameId;
    if (!gameId) {
      Stumper.error("No game ID found, not running task", "nhl:LiveDataTask:execute");
      return;
    }

    const res = await nhlApi.games.events.getGameLandingPage({ gameId });

    if (res.status == 200) {
      const gameInfo = res.data;

      if (gameInfo.gameState == "OFF") {
        // Game is over, disable the task and clear out the data
        Stumper.info(`Game ${gameId} is over, disabling task and clearing out data`, "nhl:LiveDataTask:execute");
        await db.clearLiveData();

        this.stopScheduledJob();
      } else if (gameInfo.gameState == "LIVE") {
        const period = gameInfo.periodDescriptor.number;
        const timeOnClock = gameInfo.clock.secondsRemaining;
        const isPlayoff = gameInfo.gameType == GAME_TYPE.POSTSEASON;

        if (liveData.currentPeriod == period) {
          return;
        }

        const currentGameDayThread = await db.getPostByGameId(gameId);
        if (!currentGameDayThread) {
          Stumper.error(`Cound not find thread for game ${gameId}`, "nhl:LiveDataTask:execute");
          return;
        }
        const currentGameDayThreadId = currentGameDayThread.channelId;

        if (liveData.currentPeriod == null || liveData.currentPeriod < period) {
          // The period has changed

          if (period <= 3 && timeOnClock < 1200) {
            // If it is a regulation period and the clock is not 20:00
            await db.setCurrentPeriod(period);
            Stumper.info(`Period ${period} has just started, setting current period to ${period}`, "nhl:LiveDataTask:execute");
            await this.sendPeriodNotification(currentGameDayThreadId, period, PeriodType.REG);
          } else if (period == 4 && !isPlayoff && timeOnClock < 300) {
            // If it is a non playoff overtime period and the clock is not 5:00
            await db.setCurrentPeriod(period);
            Stumper.info(`Period ${period} has just started, setting current period to ${period}`, "nhl:LiveDataTask:execute");
            await this.sendPeriodNotification(currentGameDayThreadId, period, PeriodType.OT);
          } else if (period == 5 && gameInfo.shootoutInUse && !gameInfo.clock.inIntermission) {
            // TODO: Get Live Data for this case, I'm not sure how the clock is handled for shootouts
            await db.setCurrentPeriod(period);
            Stumper.info(`Period ${period} has just started, setting current period to ${period}`, "nhl:LiveDataTask:execute");
            await this.sendPeriodNotification(currentGameDayThreadId, period, PeriodType.SHOOTOUT);
          } else if (period > 3 && isPlayoff && timeOnClock < 1200) {
            // If it is a playoff overtime period and the clock is not 20:00
            await db.setCurrentPeriod(period);
            const otPeriod = period - 3;
            Stumper.info(`OT Period ${otPeriod} has just started, setting current period to ${period}`, "nhl:LiveDataTask:execute");
            await this.sendPeriodNotification(currentGameDayThreadId, otPeriod, PeriodType.PLAYOFF_OT);
          }
        }
      }
    } else {
      Stumper.error(`Failed to get live data for game ${gameId}`, "nhl:LiveDataTask:execute");
    }
  }

  async sendPeriodNotification(threadId: string, period: number, type: PeriodType): Promise<void> {
    const periodNotificationRoleId = ConfigManager.getInstance().getConfig("NHL")["livedata.periodNotificationRoleId"];
    let message = `${roleMention(periodNotificationRoleId)}\n`;

    switch (type) {
      case PeriodType.REG:
        let periodString = "";
        if (period == 1) {
          periodString = "1st";
        } else if (period == 2) {
          periodString = "2nd";
        } else if (period == 3) {
          periodString = "3rd";
        }
        message += `The ${periodString} period has just started!`;
        break;
      case PeriodType.OT:
        message += `OT has just started!`;
        break;
      case PeriodType.SHOOTOUT:
        message += `The Shootout has just started!`;
        break;
      case PeriodType.PLAYOFF_OT:
        message += `OT${period} has just started!`;
        break;
    }

    try {
      await discord.messages.sendMessageToThread(threadId, message);
    } catch (error) {
      Stumper.caughtError(error, "nhl:LiveDataTask:sendPeriodNotification");
    }
  }
}
