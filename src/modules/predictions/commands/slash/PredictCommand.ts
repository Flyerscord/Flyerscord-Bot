import { ChatInputCommandInteraction, time, TimestampStyles } from "discord.js";
import { TEAM_TRI_CODE } from "nhl-api-wrapper-ts/dist/interfaces/Common";
import SlashCommand from "@common/models/SlashCommand";
import { getNextPredictableGame } from "../../utils/GameLookup";
import { armResolutionForGame } from "../../utils/armResolution";
import PredictionsDB from "../../db/PredictionsDB";

export default class PredictCommand extends SlashCommand {
  constructor() {
    super("predict", "Predict the score of the next Flyers game");

    this.data
      .addSubcommand((subcommand) =>
        subcommand
          .setName("submit")
          .setDescription("Submit or update your prediction for the next Flyers game")
          .addIntegerOption((option) => option.setName("flyers-score").setDescription("Predicted Flyers goals").setRequired(true).setMinValue(0))
          .addIntegerOption((option) => option.setName("opponent-score").setDescription("Predicted opponent goals").setRequired(true).setMinValue(0)),
      )
      .addSubcommand((subcommand) => subcommand.setName("view").setDescription("View your current prediction for the next Flyers game"));
  }

  async execute(interaction: ChatInputCommandInteraction): Promise<void> {
    if (this.isSubCommand(interaction, "submit")) {
      await this.executeSubmit(interaction);
    } else if (this.isSubCommand(interaction, "view")) {
      await this.executeView(interaction);
    } else {
      await this.replies.reply({ content: "Invalid subcommand!", ephemeral: true });
    }
  }

  /**
   * Submits (or overwrites) the caller's prediction for the next Flyers game, rejecting the attempt
   * once that game has already started.
   */
  private async executeSubmit(interaction: ChatInputCommandInteraction): Promise<void> {
    const game = await getNextPredictableGame();
    if (!game) {
      await this.replies.reply({ content: "There is no upcoming Flyers game to predict right now!", ephemeral: true });
      return;
    }

    if (new Date(game.startTimeUTC).getTime() <= Date.now()) {
      await this.replies.reply({ content: "Predictions are locked, the game has already started!", ephemeral: true });
      return;
    }

    const flyersScore = this.getIntegerParamValue(interaction, "flyers-score");
    const opponentScore = this.getIntegerParamValue(interaction, "opponent-score");

    const isFlyersHome = game.homeTeam.abbrev === TEAM_TRI_CODE.PHILADELPHIA_FLYERS;
    const predictedHomeScore = isFlyersHome ? flyersScore : opponentScore;
    const predictedAwayScore = isFlyersHome ? opponentScore : flyersScore;
    const opponentAbbrev = isFlyersHome ? game.awayTeam.abbrev : game.homeTeam.abbrev;

    const db = new PredictionsDB();
    await db.upsertPrediction(game.id, interaction.user.id, game.season, predictedHomeScore, predictedAwayScore);
    await armResolutionForGame(game);

    await this.replies.reply(
      `Prediction saved! Flyers ${flyersScore} - ${opponentScore} ${opponentAbbrev}. Locks ${time(new Date(game.startTimeUTC), TimestampStyles.RelativeTime)}.`,
    );
  }

  /**
   * Shows the caller's currently saved prediction for the next Flyers game, if any.
   */
  private async executeView(interaction: ChatInputCommandInteraction): Promise<void> {
    const game = await getNextPredictableGame();
    if (!game) {
      await this.replies.reply({ content: "There is no upcoming Flyers game to predict right now!", ephemeral: true });
      return;
    }

    const db = new PredictionsDB();
    const prediction = await db.getPrediction(game.id, interaction.user.id);
    if (!prediction) {
      await this.replies.reply({ content: "You haven't predicted the next Flyers game yet!", ephemeral: true });
      return;
    }

    const isFlyersHome = game.homeTeam.abbrev === TEAM_TRI_CODE.PHILADELPHIA_FLYERS;
    const flyersScore = isFlyersHome ? prediction.predictedHomeScore : prediction.predictedAwayScore;
    const opponentScore = isFlyersHome ? prediction.predictedAwayScore : prediction.predictedHomeScore;
    const opponentAbbrev = isFlyersHome ? game.awayTeam.abbrev : game.homeTeam.abbrev;

    await this.replies.reply({
      content: `Your prediction: Flyers ${flyersScore} - ${opponentScore} ${opponentAbbrev}. Locks ${time(new Date(game.startTimeUTC), TimestampStyles.RelativeTime)}.`,
      ephemeral: true,
    });
  }
}
