import nhlApi from "nhl-api-wrapper-ts";
import { GAME_TYPE, TEAM_TRI_CODE } from "nhl-api-wrapper-ts/dist/interfaces/Common";
import Time from "../../../common/utils/Time";
import Stumper from "stumper";

import discord from "../../../common/utils/discord/discord";
import { GuildForumTag, time, TimestampStyles } from "discord.js";
import Config from "../../../common/config/Config";
import GameDayPostsDB from "../providers/GameDayPosts.Database";
import { IClubScheduleOutput_games } from "nhl-api-wrapper-ts/dist/interfaces/club/schedule/ClubSchedule";
import CombinedTeamInfoCache from "../../../common/cache/CombinedTeamInfoCache";

export async function checkForGameDay(): Promise<void> {
  const res = await nhlApi.teams.schedule.getCurrentTeamSchedule({ team: TEAM_TRI_CODE.PHILADELPHIA_FLYERS });
  const db = GameDayPostsDB.getInstance();

  if (res.status == 200) {
    const game = res.data.games.find((game) => Time.isSameDay(new Date(), new Date(game.startTimeUTC)));

    if (game) {
      // Don't create a post if one already exists
      if (db.hasPostByGameId(game.id)) {
        Stumper.info(`Game ${game.id} already has a post`, "gameDayPosts:GameChecker:checkForGameDay");
        return;
      }
      const combinedTeamInfoCache = CombinedTeamInfoCache.getInstance();
      await combinedTeamInfoCache.forceUpdate();

      const homeTeam = combinedTeamInfoCache.getTeamByTeamId(game.homeTeam.id);
      const awayTeam = combinedTeamInfoCache.getTeamByTeamId(game.awayTeam.id);

      if (homeTeam && awayTeam) {
        const availableTags = await discord.forums.getAvailableTags(Config.getConfig().gameDayPosts.channelId);

        let tags: GuildForumTag[] = [];
        if (game.gameType == GAME_TYPE.PRESEASON) {
          tags = availableTags.filter((tag) => tag.id == Config.getConfig().gameDayPosts.tagIds.preseason);
        } else if (game.gameType == GAME_TYPE.REGULAR_SEASON) {
          tags = availableTags.filter((tag) => tag.id == Config.getConfig().gameDayPosts.tagIds.regularSeason);
        } else if (game.gameType == GAME_TYPE.POSTSEASON) {
          tags = availableTags.filter((tag) => tag.id == Config.getConfig().gameDayPosts.tagIds.postseason);
        }

        const seasonTag = await getCurrentSeasonTagId(game);
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
          `${titlePrefix} - ${awayTeam.franchise.teamCommonName} @ ${homeTeam.franchise.teamCommonName}`,
          `${time(new Date(game.startTimeUTC), TimestampStyles.RelativeTime)}`,
          tags,
        );

        if (post) {
          post.setArchived(false);
          Stumper.info(`Created post for game: ${game.id}`, "gameDayPosts:GameChecker:checkForGameDay");
          db.addPost(game.id, post.id);
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

      if (!Time.isSameDay(new Date(), new Date(gameInfo.startTimeUTC))) {
        Stumper.info(`Closing and locking post for game ${post.gameId}`, "gameDayPosts:GameChecker:checkForGameDay");
        discord.forums.setLockPost(Config.getConfig().gameDayPosts.channelId, post.channelId, true);
        discord.forums.setClosedPost(Config.getConfig().gameDayPosts.channelId, post.channelId, true);
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

      for (const seasonGame of seasonGames) {
        if (seasonGame.gameType == gameType) {
          gameNumber++;
        }

        if (seasonGame.id == gameId) {
          return gameNumber;
        }
      }
    }
  }

  return undefined;
}

async function getCurrentSeasonTagId(game: IClubScheduleOutput_games): Promise<GuildForumTag | undefined> {
  const availableTags = await discord.forums.getAvailableTags(Config.getConfig().gameDayPosts.channelId);

  const seasonTags = Config.getConfig().gameDayPosts.tagIds.seasons;

  for (const seasonTag of seasonTags) {
    if (game.season.toString() == `${seasonTag.startingYear}${seasonTag.endingYear}`) {
      return availableTags.find((tag) => tag.id == seasonTag.tagId);
    }
  }
  return undefined;
}
