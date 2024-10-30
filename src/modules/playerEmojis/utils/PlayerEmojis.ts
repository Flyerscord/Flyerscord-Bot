import { ITeamRosterNowOutput } from "nhl-api-wrapper-ts/dist/interfaces/roster/TeamRosterNow";
import PlayerEmojisDB from "../providers/PlayerEmojis.Database";
import discord from "../../../common/utils/discord/discord";
import Stumper from "stumper";
import nhlApi from "nhl-api-wrapper-ts";
import { TEAM_TRI_CODE } from "nhl-api-wrapper-ts/dist/interfaces/Common";

export async function checkForNewEmojis(): Promise<void> {
  const db = PlayerEmojisDB.getInstance();
  const rosterRes = await nhlApi.teams.roster.getCurrentTeamRoster({ team: TEAM_TRI_CODE.PHILADELPHIA_FLYERS });

  if (rosterRes.status == 200) {
    const roster = rosterRes.data;

    if (!checkForNewPlayers(roster)) {
      Stumper.info("No new players found", "EmojiCheckTask");
      return;
    }

    await removeOldEmojis();

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

export async function removeOldEmojis(): Promise<void> {
  const db = PlayerEmojisDB.getInstance();

  const oldEmojiIds = db.getAllPlayers();

  for (const emojiId of oldEmojiIds) {
    await discord.emojis.deleteEmoji(emojiId, "Deleting old player emoji");
  }
  db.clearPlayers();
}

function checkForNewPlayers(roster: ITeamRosterNowOutput): boolean {
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
