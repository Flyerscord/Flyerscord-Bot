import Task from "../../../common/models/Task.js";
import nhlApi from "nhl-api-wrapper-ts";
import PlayerEmojisDB from "../providers/PlayerEmojis.Database";
import { TEAM_TRI_CODE } from "nhl-api-wrapper-ts/dist/interfaces/Common.js";
import discord from "../../../common/utils/discord/discord.js";
import { ITeamRosterNowOutput } from "nhl-api-wrapper-ts/dist/interfaces/roster/TeamRosterNow.js";
import Stumper from "stumper";

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

      if (!this.checkForNewPlayers(roster)) {
        Stumper.info("No new players found", "EmojiCheckTask");
        return;
      }

      this.removeOldEmojis();

      for (const player of roster.forwards) {
        const playerName = player.lastName.default.toLowerCase() + player.firstName.default.charAt(0).toUpperCase();

        const emoji = await discord.emojis.addEmoji({ name: playerName, url: player.headshot });
        if (emoji) {
          db.addPlayer(player.id, emoji.id);
        }
      }

      for (const player of roster.defensemen) {
        const playerName = player.lastName.default.toLowerCase() + player.firstName.default.charAt(0).toUpperCase();

        const emoji = await discord.emojis.addEmoji({ name: playerName, url: player.headshot });
        if (emoji) {
          db.addPlayer(player.id, emoji.id);
        }
      }

      for (const player of roster.goalies) {
        const playerName = player.lastName.default.toLowerCase() + player.firstName.default.charAt(0).toUpperCase();

        const emoji = await discord.emojis.addEmoji({ name: playerName, url: player.headshot });
        if (emoji) {
          db.addPlayer(player.id, emoji.id);
        }
      }
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

  private checkForNewPlayers(roster: ITeamRosterNowOutput): boolean {
    const db = PlayerEmojisDB.getInstance();

    // Check if the roster has the same number of players as the db
    const rosterPlayerCount = roster.forwards.length + roster.defensemen.length + roster.goalies.length;
    if (rosterPlayerCount != db.getAllPlayers().length) {
      return true;
    }

    const forwardPlayerIds = roster.forwards.map((player) => player.id);
    const defensePlayerIds = roster.defensemen.map((player) => player.id);
    const goaliePlayerIds = roster.goalies.map((player) => player.id);
    const rosterPlayerIds = forwardPlayerIds.concat(defensePlayerIds).concat(goaliePlayerIds);
    const dbPlayerIds = db.getAllPlayersIds();

    // Check if any of the players in the roster are not in the db
    rosterPlayerIds.forEach((playerId) => {
      if (!dbPlayerIds.includes(playerId)) {
        return true;
      }
    });

    // Check if any of the players in the db are not in the roster
    dbPlayerIds.forEach((playerId) => {
      if (!rosterPlayerIds.includes(playerId)) {
        return true;
      }
    });

    return false;
  }
}
