import Task from "@common/models/Task";
import Stumper from "stumper";
import ConfigManager from "@common/managers/ConfigManager";
import discord from "@common/utils/discord/discord";
import PredictionsDB from "../db/PredictionsDB";
import { getNextPredictableGame } from "../utils/GameLookup";
import { armResolutionForGame } from "../utils/armResolution";
import { buildAnnouncementEmbed } from "../utils/Embeds";

export default class AnnounceGameTask extends Task {
  constructor() {
    // Run every day at 9:00 AM
    super("AnnounceGame", "0 0 9 * * *");
  }

  protected async execute(): Promise<void> {
    const game = await getNextPredictableGame();
    if (!game) {
      return;
    }

    await armResolutionForGame(game);

    const db = new PredictionsDB();
    const state = await db.getState();
    if (!state || state.gameId !== game.id || state.announced) {
      return;
    }

    const config = ConfigManager.getInstance().getConfig("Predictions");
    const channel = await discord.channels.getTextChannel(config.resultsChannelId);
    if (!channel) {
      Stumper.error("Could not find the configured Predictions results channel!", "predictions:AnnounceGameTask:execute");
      return;
    }

    await channel.send({ embeds: [buildAnnouncementEmbed(game)] });
    await db.setAnnounced();
  }
}
