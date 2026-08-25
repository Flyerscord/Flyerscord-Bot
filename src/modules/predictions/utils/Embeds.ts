import { bold, EmbedBuilder } from "discord.js";
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
