import Task from "@common/models/Task";
import nhlApi from "nhl-api-wrapper-ts";
import Stumper from "stumper";
import ConfigManager from "@common/managers/ConfigManager";
import discord from "@common/utils/discord/discord";
import PredictionsDB from "../db/PredictionsDB";
import { PeriodType } from "../db/schema";
import { calculatePoints, getPredictionOutcome } from "../utils/scoring";
import { buildResultsEmbed, ResolvedPredictionResult } from "../utils/Embeds";

export default class PollGameResultTask extends Task {
  private db: PredictionsDB;

  constructor() {
    // Run every 30 seconds
    super("PollGameResult", "*/30 * * * * *");
    this.db = new PredictionsDB();
  }

  protected async execute(): Promise<void> {
    const state = await this.db.getState();
    if (!state || !state.gameId) {
      Stumper.error("No tracked game found, not running task", "predictions:PollGameResultTask:execute");
      this.stopScheduledJob();
      return;
    }

    const gameId = state.gameId;
    const res = await nhlApi.games.events.getGameLandingPage({ gameId });

    if (res.status !== 200) {
      Stumper.error(`Failed to get game landing page for game ${gameId}`, "predictions:PollGameResultTask:execute");
      return;
    }

    const gameInfo = res.data;
    if (gameInfo.gameState !== "OFF" && gameInfo.gameState !== "FINAL") {
      return;
    }

    Stumper.info(`Game ${gameId} is over, resolving predictions`, "predictions:PollGameResultTask:execute");
    this.stopScheduledJob();

    const actualHomeScore = gameInfo.homeTeam.score;
    const actualAwayScore = gameInfo.awayTeam.score;
    const actualPeriodType = gameInfo.periodDescriptor.periodType as PeriodType;
    const config = ConfigManager.getInstance().getConfig("Predictions");

    const predictions = await this.db.getUnresolvedPredictionsForGame(gameId);
    const results: ResolvedPredictionResult[] = [];

    for (const prediction of predictions) {
      const outcome = getPredictionOutcome(
        prediction.predictedHomeScore,
        prediction.predictedAwayScore,
        prediction.predictedPeriodType,
        actualHomeScore,
        actualAwayScore,
        actualPeriodType,
      );
      const points = calculatePoints(outcome, config.exactPoints, config.exactScorePoints, config.correctWinnerPoints);

      await this.db.resolvePrediction(prediction.id, actualHomeScore, actualAwayScore, actualPeriodType, points);

      results.push({
        userId: prediction.userId,
        predictedHomeScore: prediction.predictedHomeScore,
        predictedAwayScore: prediction.predictedAwayScore,
        predictedPeriodType: prediction.predictedPeriodType,
        outcome,
        points,
      });
    }

    await this.db.clearState();

    const channel = await discord.channels.getTextChannel(config.resultsChannelId);
    if (!channel) {
      Stumper.error("Could not find the configured Predictions results channel!", "predictions:PollGameResultTask:execute");
      return;
    }

    const embed = await buildResultsEmbed(
      gameInfo.homeTeam.abbrev,
      gameInfo.awayTeam.abbrev,
      actualHomeScore,
      actualAwayScore,
      actualPeriodType,
      results,
    );
    await channel.send({ embeds: [embed] });
  }
}
