import nhlApi from "nhl-api-wrapper-ts";
import { GAME_TYPE, TEAM_TRI_CODE } from "nhl-api-wrapper-ts/dist/interfaces/Common";
import Time from "../../../common/utils/Time";
import Logger from "stumper";

import discord from "../../../common/utils/discord/discord";
import { time, TimestampStyles } from "discord.js";
import Config from "../../../common/config/Config";
import GameDayPostsDB from "../providers/GameDayPosts.Database";

export async function checkForGameDay(): Promise<void> {
  const res = await nhlApi.teams.schedule.getCurrentTeamSchedule({ team: TEAM_TRI_CODE.PHILADELPHIA_FLYERS });

  if (res.status == 200) {
    const game = res.data.games.find((game) => Time.isSameDay(new Date(), new Date(game.gameDate)));

    if (game) {
      const teamsRes = await nhlApi.teams.getTeams({ lang: "en" });

      if (teamsRes.status == 200) {
        const teams = teamsRes.data.data;

        const homeTeam = teams.find((team) => team.id == game.homeTeam.id);
        const awayTeam = teams.find((team) => team.id == game.awayTeam.id);

        if (homeTeam && awayTeam) {
          const tags = discord.forums.getAvailableTags(Config.getConfig().gameDayChannelId).filter((tag) => tag.id == "1286197120105320510");

          let titlePrefix = "";
          const gameNumber = await getGameNumber(game.id);
          if (game.gameType == GAME_TYPE.PRESEASON) {
            titlePrefix = `Preseason ${gameNumber}`;
          } else if (game.gameType == GAME_TYPE.REGULAR_SEASON) {
            titlePrefix = `Game ${gameNumber}`;
          } else if (game.gameType == GAME_TYPE.POSTSEASON) {
            // TODO: Implement logic for playoff rounds
            titlePrefix = `Postseason ${gameNumber}`;
          }

          const post = await discord.forums.createPost(
            Config.getConfig().gameDayChannelId,
            `${titlePrefix} - ${awayTeam.fullName} @ ${homeTeam.fullName}`,
            `${time(new Date(game.startTimeUTC), TimestampStyles.RelativeTime)}`,
            tags,
          );

          if (post) {
            Logger.info(`Created post for game: ${game.id}`, "checkForGameDay");
            const db = GameDayPostsDB.getInstance();
            db.addPost(game.id, post.id);
          }
        }
      }
    }
  }
}

export async function closeAndLockOldPosts(): Promise<void> {
  const db = GameDayPostsDB.getInstance();
  const gameDayPosts = db.getAllPost();

  gameDayPosts.forEach(async (post) => {
    const gameInfoResp = await nhlApi.games.events.getGameLandingPage({ gameId: post.gameId });

    if (gameInfoResp.status == 200) {
      const gameInfo = gameInfoResp.data;

      if (Time.isSameDay(new Date(), new Date(gameInfo.gameDate))) {
        discord.forums.setClosedPost(Config.getConfig().gameDayChannelId, post.channelId, true);
        discord.forums.setLockPost(Config.getConfig().gameDayChannelId, post.channelId, true);
      }
    }
  });
}

async function getGameNumber(gameId: number): Promise<number | undefined> {
  const gameResp = await nhlApi.games.getGameInfo({ gameId: gameId });
  let gameType: GAME_TYPE | undefined = undefined;

  if (gameResp.status == 200) {
    const game = gameResp.data;
    gameType = game.seasonStates.gameType;

    const seasonGamesResp = await nhlApi.teams.schedule.getCurrentTeamSchedule({ team: TEAM_TRI_CODE.PHILADELPHIA_FLYERS });

    let gameNumber = 0;
    if (seasonGamesResp.status == 200) {
      const seasonGames = seasonGamesResp.data.games;

      seasonGames.forEach((seasonGame) => {
        if (seasonGame.gameType == gameType) {
          gameNumber++;
        }

        if (seasonGame.id == gameId) {
          return gameNumber;
        }
      });
    }
  }

  return undefined;
}
