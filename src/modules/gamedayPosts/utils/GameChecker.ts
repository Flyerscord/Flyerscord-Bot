import nhlApi from "nhl-api-wrapper-ts";
import { GAME_TYPE, TEAM_TRI_CODE } from "nhl-api-wrapper-ts/dist/interfaces/Common.js";
import Time from "../../../common/utils/Time.js";
import Stumper from "stumper";

import discord from "../../../common/utils/discord/discord.js";
import { GuildForumTag, time, TimestampStyles } from "discord.js";
import Config from "../../../common/config/Config.js";
import GameDayPostsDB from "../providers/GameDayPosts.Database.js";
import { IClubScheduleOutput_games } from "nhl-api-wrapper-ts/dist/interfaces/club/schedule/ClubSchedule.js";

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
          const availableTags = discord.forums.getAvailableTags(Config.getConfig().gameDayPosts.channelId);

          let tags: GuildForumTag[] = [];
          if (game.gameType == GAME_TYPE.PRESEASON) {
            tags = availableTags.filter((tag) => tag.id == Config.getConfig().gameDayPosts.tagIds.preseason);
          } else if (game.gameType == GAME_TYPE.REGULAR_SEASON) {
            tags = availableTags.filter((tag) => tag.id == Config.getConfig().gameDayPosts.tagIds.regularSeason);
          } else if (game.gameType == GAME_TYPE.POSTSEASON) {
            tags = availableTags.filter((tag) => tag.id == Config.getConfig().gameDayPosts.tagIds.postseason);
          }

          const seasonTag = getCurrentSeasonTagId(game);
          if (seasonTag) {
            tags.push(seasonTag);
          }

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
            Config.getConfig().gameDayPosts.channelId,
            `${titlePrefix} - ${awayTeam.fullName} @ ${homeTeam.fullName}`,
            `${time(new Date(game.startTimeUTC), TimestampStyles.RelativeTime)}`,
            tags,
          );

          if (post) {
            Stumper.info(`Created post for game: ${game.id}`, "checkForGameDay");
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

  for (const post of gameDayPosts) {
    const gameInfoResp = await nhlApi.games.events.getGameLandingPage({ gameId: post.gameId });

    if (gameInfoResp.status == 200) {
      const gameInfo = gameInfoResp.data;

      if (Time.isSameDay(new Date(), new Date(gameInfo.gameDate))) {
        discord.forums.setClosedPost(Config.getConfig().gameDayPosts.channelId, post.channelId, true);
        discord.forums.setLockPost(Config.getConfig().gameDayPosts.channelId, post.channelId, true);
      }
    }
  }
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

function getCurrentSeasonTagId(game: IClubScheduleOutput_games): GuildForumTag | undefined {
  const availableTags = discord.forums.getAvailableTags(Config.getConfig().gameDayPosts.channelId);

  const seasonTags = Config.getConfig().gameDayPosts.tagIds.seasons;

  seasonTags.forEach((seasonTag) => {
    if (game.season.toString() == `${seasonTag.startingYear}${seasonTag.endingYear}`) {
      return availableTags.find((tag) => tag.id == seasonTag.tagId);
    }
  });
  return undefined;
}
