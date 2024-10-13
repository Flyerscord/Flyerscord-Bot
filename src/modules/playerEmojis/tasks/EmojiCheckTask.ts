import Task from "../../../common/models/Task";
import nhlApi from "nhl-api-wrapper-ts";
import PlayerEmojisDB from "../providers/PlayerEmojis.Database";
import { TEAM_TRI_CODE } from "nhl-api-wrapper-ts/dist/interfaces/Common";
import discord from "../../../common/utils/discord/discord";

export default class EmojiCheckTask extends Task {
  constructor() {
    // Run every 15th day of the month at midnight
    super("EmojiCheckTask", "0 0 0 15 * *");
  }

  protected async execute(): Promise<void> {
    const db = PlayerEmojisDB.getInstance();
    const rosterRes = await nhlApi.teams.roster.getCurrentTeamRoster({ team: TEAM_TRI_CODE.PHILADELPHIA_FLYERS });

    if (rosterRes.status == 200) {
      const roster = rosterRes.data;

      roster.forwards.forEach(async (player) => {
        const playerName = player.lastName.default.toLowerCase() + player.firstName.default.charAt(0).toUpperCase();

        // TODO: Remove background from headshot
        const emoji = await discord.emojis.addEmoji({ name: playerName, url: player.headshot });
        if (emoji) {
          db.addPlayer(playerName, emoji.id);
        }
      });
    }
  }

  private removeOldEmojis(): void {
    const db = PlayerEmojisDB.getInstance();

    const oldEmojiIds = db.getAllPlayers();

    oldEmojiIds.forEach((emojiId) => {
      discord.emojis.deleteEmoji(emojiId, "Deleting old player emoji");
    });
    db.clearPlayers();
  }
}
