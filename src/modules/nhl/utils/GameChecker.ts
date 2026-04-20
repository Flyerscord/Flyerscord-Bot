import nhlApi from "nhl-api-wrapper-ts";
import { GAME_TYPE, TEAM_TRI_CODE } from "nhl-api-wrapper-ts/dist/interfaces/Common";
import Time from "@common/utils/Time";
import Stumper from "stumper";

import discord from "@common/utils/discord/discord";
import { GuildForumTag, time, TimestampStyles } from "discord.js";
import { IClubScheduleOutput_games } from "nhl-api-wrapper-ts/dist/interfaces/club/schedule/ClubSchedule";
import CombinedTeamInfoCache from "@common/cache/CombinedTeamInfoCache";
import ConfigManager from "@common/managers/ConfigManager";
import NHLDB from "../db/NHLDB";
import GameStartTask from "../tasks/GameStartTask";

export async function checkForGameDay(): Promise<void> {
  const res = await nhlApi.teams.schedule.getCurrentTeamSchedule({ team: TEAM_TRI_CODE.PHILADELPHIA_FLYERS });
  const db = new NHLDB();
  const config = ConfigManager.getInstance().getConfig("NHL");

  if (res.status == 200) {
    const game = res.data.games.find((game) => Time.isSameDay(new Date(), new Date(game.startTimeUTC)));

    if (game) {
      try {
        await setupLiveData(game);
      } catch (error) {
        Stumper.error(`Failed to setup live data for game ${game.id}`, "nhl:GameChecker:checkForGameDay");
        Stumper.caughtError(error, "nhl:GameChecker:checkForGameDay");
      }

      // Don't create a post if one already exists
      if (await db.hasPostByGameId(game.id)) {
        Stumper.info(`Game ${game.id} already has a post`, "gameDayPosts:GameChecker:checkForGameDay");
        return;
      }
      const combinedTeamInfoCache = CombinedTeamInfoCache.getInstance();
      await combinedTeamInfoCache.forceUpdate();

      const homeTeam = combinedTeamInfoCache.getTeamByTeamId(game.homeTeam.id);
      const awayTeam = combinedTeamInfoCache.getTeamByTeamId(game.awayTeam.id);

      if (homeTeam && awayTeam) {
        const availableTags = await discord.forums.getAvailableTags(config.channelId);

        let tags: GuildForumTag[] = [];
        if (game.gameType == GAME_TYPE.PRESEASON) {
          tags = availableTags.filter((tag) => tag.id == config["tagIds.preseason"]);
        } else if (game.gameType == GAME_TYPE.REGULAR_SEASON) {
          tags = availableTags.filter((tag) => tag.id == config["tagIds.regularSeason"]);
        } else if (game.gameType == GAME_TYPE.POSTSEASON) {
          tags = availableTags.filter((tag) => tag.id == config["tagIds.postSeason"]);
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
        } else if (game.gameType == GAME_TYPE.POSTSEASON && game.seriesStatus) {
          const seriesStatus = game.seriesStatus;
          titlePrefix = `${seriesStatus.seriesTitle} - Game ${seriesStatus.gameNumberOfSeries}`;
        }

        const post = await discord.forums.createPost(
          config.channelId,
          `${titlePrefix} - ${awayTeam.franchise.teamCommonName} @ ${homeTeam.franchise.teamCommonName}`,
          `${time(new Date(game.startTimeUTC), TimestampStyles.RelativeTime)}`,
          tags,
        );

        if (post) {
          await post.setArchived(false);
          void db.createAuditLog({
            action: "GameDayPostCreated",
            details: {
              gameId: game.id,
              postId: post.id,
            },
          });
          Stumper.info(`Created post for game: ${game.id}`, "gameDayPosts:GameChecker:checkForGameDay");
          await db.addPost(game.id, post.id);
        }
      }
    }
  }
}

export async function closeAndLockOldPosts(): Promise<void> {
  const db = new NHLDB();
  const gameDayPosts = await db.getAllPost();
  const config = ConfigManager.getInstance().getConfig("NHL");

  for (const post of gameDayPosts) {
    const gameInfoResp = await nhlApi.games.events.getGameLandingPage({ gameId: post.gameId });

    if (gameInfoResp.status == 200) {
      const gameInfo = gameInfoResp.data;

      if (!Time.isSameDay(new Date(), new Date(gameInfo.startTimeUTC))) {
        Stumper.info(`Closing and locking post for game ${post.gameId}`, "gameDayPosts:GameChecker:closeAndLockOldPosts");
        try {
          await discord.forums.setLockPost(config.channelId, post.channelId, true);
          await discord.forums.setClosedPost(config.channelId, post.channelId, true);
        } catch (error) {
          Stumper.caughtError(error, "gameDayPosts:GameChecker:closeAndLockOldPosts");
        }
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
  const config = ConfigManager.getInstance().getConfig("NHL");
  const availableTags = await discord.forums.getAvailableTags(config.channelId);

  const seasonTags = config["tagIds.seasons"];

  for (const seasonTag of seasonTags) {
    if (game.season.toString() == `${seasonTag.startingYear}${seasonTag.endingYear}`) {
      return availableTags.find((tag) => tag.id == seasonTag.tagId);
    }
  }
  return undefined;
}

export async function setupLiveData(game: IClubScheduleOutput_games): Promise<void> {
  if (game.gameState === "FUT") {
    const db = new NHLDB();
    const gameStartTask = GameStartTask.getInstance();
    const gameStartTime = new Date(game.startTimeUTC);

    if (!gameStartTask.isActive()) {
      // Start the task 10 minutes before the game starts
      gameStartTime.setMinutes(gameStartTime.getMinutes() - 10);
      gameStartTask.setDate(gameStartTime);
    }
    await db.setCurrentGame(game.id, new Date(game.startTimeUTC));
  }
}
