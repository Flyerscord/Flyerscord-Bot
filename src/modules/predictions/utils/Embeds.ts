import { bold, EmbedBuilder, time, TimestampStyles } from "discord.js";
import { TEAM_TRI_CODE } from "nhl-api-wrapper-ts/dist/interfaces/Common";
import { IClubScheduleOutput_games } from "nhl-api-wrapper-ts/dist/interfaces/club/schedule/ClubSchedule";
import discord from "@common/utils/discord/discord";
import Stumper from "stumper";
import { PeriodType } from "../db/schema";
import { PredictionOutcome } from "./scoring";

export interface ResolvedPredictionResult {
  userId: string;
  predictedHomeScore: number;
  predictedAwayScore: number;
  predictedPeriodType: PeriodType;
  outcome: PredictionOutcome;
  points: number;
}

const OUTCOME_LABEL: Record<PredictionOutcome, string> = {
  [PredictionOutcome.EXACT]: "Exact score and ending!",
  [PredictionOutcome.EXACT_SCORE]: "Exact score, wrong ending",
  [PredictionOutcome.CORRECT_WINNER]: "Correct winner",
  [PredictionOutcome.INCORRECT]: "Incorrect",
};

const PERIOD_TYPE_LABEL: Record<PeriodType, string> = {
  [PeriodType.REGULATION]: "Regulation",
  [PeriodType.OVERTIME]: "Overtime",
  [PeriodType.SHOOTOUT]: "Shootout",
};

/**
 * Builds the embed posted when predictions open for the next Flyers game: the matchup and the
 * time predictions lock (puck drop).
 */
export function buildAnnouncementEmbed(game: IClubScheduleOutput_games): EmbedBuilder {
  const isFlyersHome = game.homeTeam.abbrev === TEAM_TRI_CODE.PHILADELPHIA_FLYERS;
  const opponentAbbrev = isFlyersHome ? game.awayTeam.abbrev : game.homeTeam.abbrev;
  const matchup = isFlyersHome ? `${opponentAbbrev} @ PHI` : `PHI @ ${opponentAbbrev}`;

  return new EmbedBuilder()
    .setTitle("Predictions are open!")
    .setDescription(
      `${bold(matchup)}\nUse \`/predict submit\` to predict the score before puck drop, ${time(new Date(game.startTimeUTC), TimestampStyles.RelativeTime)}.`,
    )
    .setColor("Random")
    .setTimestamp(Date.now());
}

/**
 * Builds the embed posted to the results channel once a predicted game finishes, listing every
 * user's prediction against the actual final score and the points they earned.
 */
export async function buildResultsEmbed(
  homeAbbrev: string,
  awayAbbrev: string,
  actualHomeScore: number,
  actualAwayScore: number,
  actualPeriodType: PeriodType,
  results: ResolvedPredictionResult[],
): Promise<EmbedBuilder> {
  const embed = new EmbedBuilder()
    .setTitle("Prediction Results")
    .setDescription(
      `Final Score: ${bold(awayAbbrev)} ${actualAwayScore} - ${actualHomeScore} ${bold(homeAbbrev)} (${PERIOD_TYPE_LABEL[actualPeriodType]})`,
    )
    .setColor("Random")
    .setTimestamp(Date.now());

  if (results.length === 0) {
    embed.addFields({ name: "No predictions", value: "Nobody predicted this game." });
    return embed;
  }

  for (const result of results) {
    const member = await discord.members.getMember(result.userId, false);
    let username = "Unknown User";
    if (member) {
      username = member.displayName || member.user.username;
    } else {
      Stumper.debug(`Failed to find member with user id: ${result.userId}. User probably left server`, "predictions:Embeds:buildResultsEmbed");
      const discordUser = await discord.users.getUser(result.userId, true);
      if (discordUser) {
        username = discordUser.displayName || discordUser.username;
      }
    }

    embed.addFields({
      name: username,
      value: `Predicted: ${result.predictedAwayScore} - ${result.predictedHomeScore} (${PERIOD_TYPE_LABEL[result.predictedPeriodType]}) | ${OUTCOME_LABEL[result.outcome]} | ${bold("Points:")} ${result.points}`,
    });
  }

  return embed;
}
