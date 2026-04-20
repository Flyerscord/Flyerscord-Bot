// Mock all external dependencies before imports

const mockStumper = {
  error: jest.fn(),
  warning: jest.fn(),
  caughtError: jest.fn(),
  success: jest.fn(),
  info: jest.fn(),
  debug: jest.fn(),
};

jest.mock("stumper", () => mockStumper);

// Mock NHLDB
const mockNHLDB = {
  setCurrentGame: jest.fn().mockResolvedValue(undefined),
  getCurrentLiveData: jest.fn().mockResolvedValue(null),
  hasPostByGameId: jest.fn().mockResolvedValue(false),
  addPost: jest.fn().mockResolvedValue(undefined),
  getAllPost: jest.fn().mockResolvedValue([]),
  getPostByGameId: jest.fn().mockResolvedValue(undefined),
  ensureLiveDataRowExists: jest.fn().mockResolvedValue(undefined),
  clearLiveData: jest.fn().mockResolvedValue(undefined),
  createAuditLog: jest.fn().mockResolvedValue(undefined),
};

jest.mock("@modules/nhl/db/NHLDB", () => ({
  __esModule: true,
  default: jest.fn().mockImplementation(() => mockNHLDB),
}));

// Mock GameStartTask
let mockGameStartTaskIsActive = false;
const mockGameStartTask = {
  isActive: jest.fn().mockImplementation(() => mockGameStartTaskIsActive),
  setDate: jest.fn(),
  removeScheduledJob: jest.fn(),
  createScheduledJob: jest.fn(),
};

jest.mock("@modules/nhl/tasks/GameStartTask", () => ({
  __esModule: true,
  default: {
    getInstance: jest.fn(() => mockGameStartTask),
  },
}));

// Mock LiveDataTask
const mockLiveDataTask = {
  createScheduledJob: jest.fn(),
  stopScheduledJob: jest.fn(),
};

jest.mock("@modules/nhl/tasks/LiveDataTask", () => ({
  __esModule: true,
  default: {
    getInstance: jest.fn(() => mockLiveDataTask),
  },
}));

// Mock nhl-api-wrapper-ts
jest.mock("nhl-api-wrapper-ts", () => ({
  __esModule: true,
  default: {
    teams: {
      schedule: {
        getCurrentTeamSchedule: jest.fn(),
      },
    },
    games: {
      events: {
        getGameLandingPage: jest.fn(),
      },
      getGameInfo: jest.fn(),
    },
  },
}));

// Mock ConfigManager
jest.mock("@common/managers/ConfigManager", () => ({
  __esModule: true,
  default: {
    getInstance: jest.fn(() => ({
      getConfig: jest.fn(() => ({
        channelId: "test-channel-id",
        "tagIds.preseason": "preseason-tag-id",
        "tagIds.regularSeason": "regular-season-tag-id",
        "tagIds.postSeason": "post-season-tag-id",
        "tagIds.seasons": [],
        "livedata.periodNotificationRoleId": "role-id-123",
      })),
    })),
  },
}));

// Mock discord utilities
jest.mock("@common/utils/discord/discord", () => ({
  __esModule: true,
  default: {
    forums: {
      getAvailableTags: jest.fn().mockResolvedValue([]),
      createPost: jest.fn().mockResolvedValue(null),
      setLockPost: jest.fn().mockResolvedValue(undefined),
      setClosedPost: jest.fn().mockResolvedValue(undefined),
    },
    messages: {
      sendMessageToThread: jest.fn().mockResolvedValue(undefined),
    },
  },
}));

// Mock Time utility
jest.mock("@common/utils/Time", () => ({
  __esModule: true,
  default: {
    isSameDay: jest.fn().mockReturnValue(false),
  },
}));

// Mock CombinedTeamInfoCache
jest.mock("@common/cache/CombinedTeamInfoCache", () => ({
  __esModule: true,
  default: {
    getInstance: jest.fn(() => ({
      forceUpdate: jest.fn().mockResolvedValue(undefined),
      getTeamByTeamId: jest.fn().mockReturnValue(null),
    })),
  },
}));

// Mock discord.js
jest.mock("discord.js", () => ({
  GuildForumTag: jest.fn(),
  time: jest.fn((date: Date) => `<t:${Math.floor(date.getTime() / 1000)}:R>`),
  TimestampStyles: { RelativeTime: "R" },
  roleMention: jest.fn((id: string) => `<@&${id}>`),
}));

import { setupLiveData } from "@modules/nhl/utils/GameChecker";
import { IClubScheduleOutput_games } from "nhl-api-wrapper-ts/dist/interfaces/club/schedule/ClubSchedule";

// Helper to build a minimal game object
function makeGame(overrides: Partial<IClubScheduleOutput_games> = {}): IClubScheduleOutput_games {
  return {
    id: 2024123456,
    startTimeUTC: new Date(Date.now() + 3_600_000).toISOString(), // 1 hour from now
    gameState: "FUT",
    gameType: 2,
    season: 20242025,
    homeTeam: { id: 4 } as IClubScheduleOutput_games["homeTeam"],
    awayTeam: { id: 10 } as IClubScheduleOutput_games["awayTeam"],
    ...overrides,
  } as IClubScheduleOutput_games;
}

describe("GameChecker - setupLiveData", () => {
  beforeEach(() => {
    jest.clearAllMocks();
    mockGameStartTaskIsActive = false;
    mockGameStartTask.isActive.mockImplementation(() => mockGameStartTaskIsActive);
  });

  describe("when gameState is FUT (future game)", () => {
    it("should set the game start time in DB", async () => {
      const futureTime = new Date(Date.now() + 3_600_000);
      const game = makeGame({ gameState: "FUT", startTimeUTC: futureTime.toISOString() });

      await setupLiveData(game);

      expect(mockNHLDB.setCurrentGame).toHaveBeenCalledWith(game.id, futureTime);
    });

    it("should set a date on GameStartTask 10 minutes before game start", async () => {
      const futureTime = new Date(Date.now() + 3_600_000);
      const game = makeGame({ gameState: "FUT", startTimeUTC: futureTime.toISOString() });

      await setupLiveData(game);

      expect(mockGameStartTask.setDate).toHaveBeenCalledTimes(1);
      const setDateArg: Date = mockGameStartTask.setDate.mock.calls[0][0];
      // The set date should be 10 minutes before game start
      const expectedTime = new Date(futureTime.getTime());
      expectedTime.setMinutes(expectedTime.getMinutes() - 10);
      expect(setDateArg.getTime()).toBeCloseTo(expectedTime.getTime(), -2);
    });

    it("should not set date when GameStartTask is already active", async () => {
      mockGameStartTaskIsActive = true;
      const futureTime = new Date(Date.now() + 3_600_000);
      const game = makeGame({ gameState: "FUT", startTimeUTC: futureTime.toISOString() });

      await setupLiveData(game);

      expect(mockGameStartTask.setDate).not.toHaveBeenCalled();
      // DB should still be updated
      expect(mockNHLDB.setCurrentGame).toHaveBeenCalled();
    });
  });

  describe("when gameState is LIVE (live game)", () => {
    it("should not process a live game when onStartup is false (default)", async () => {
      const game = makeGame({ gameState: "LIVE" });

      await setupLiveData(game);

      expect(mockNHLDB.setCurrentGame).not.toHaveBeenCalled();
      expect(mockGameStartTask.setDate).not.toHaveBeenCalled();
      expect(mockLiveDataTask.createScheduledJob).not.toHaveBeenCalled();
    });

    it("should process a live game on startup", async () => {
      const futureTime = new Date(Date.now() + 3_600_000);
      const game = makeGame({ gameState: "LIVE", startTimeUTC: futureTime.toISOString() });

      await setupLiveData(game, true);

      expect(mockNHLDB.setCurrentGame).toHaveBeenCalledWith(game.id, futureTime);
    });

    it("should start LiveDataTask immediately on startup if game start time - 10min is in past", async () => {
      // Game started 5 minutes ago => 10 min before game start = 15 minutes ago (in the past)
      const pastStartTime = new Date(Date.now() - 5 * 60_000);
      const game = makeGame({ gameState: "LIVE", startTimeUTC: pastStartTime.toISOString() });

      await setupLiveData(game, true);

      expect(mockLiveDataTask.createScheduledJob).toHaveBeenCalledTimes(1);
      expect(mockGameStartTask.setDate).not.toHaveBeenCalled();
      expect(mockStumper.warning).toHaveBeenCalledWith(
        expect.stringContaining("Game start time is in the past"),
        "nhl:GameChecker:setupLiveData",
      );
    });

    it("should set GameStartTask date on startup if game start time - 10min is still in future", async () => {
      // Game starts in 30 minutes => 10 min before = 20 minutes from now (in future)
      const futureStartTime = new Date(Date.now() + 30 * 60_000);
      const game = makeGame({ gameState: "LIVE", startTimeUTC: futureStartTime.toISOString() });

      await setupLiveData(game, true);

      expect(mockGameStartTask.setDate).toHaveBeenCalledTimes(1);
      expect(mockLiveDataTask.createScheduledJob).not.toHaveBeenCalled();
    });
  });

  describe("when gameState is OFF (game over)", () => {
    it("should not process a finished game", async () => {
      const game = makeGame({ gameState: "OFF" });

      await setupLiveData(game);

      expect(mockNHLDB.setCurrentGame).not.toHaveBeenCalled();
      expect(mockGameStartTask.setDate).not.toHaveBeenCalled();
    });

    it("should not process a finished game even on startup", async () => {
      const game = makeGame({ gameState: "OFF" });

      await setupLiveData(game, true);

      expect(mockNHLDB.setCurrentGame).not.toHaveBeenCalled();
    });
  });

  describe("when gameState is PRE (pre-game)", () => {
    it("should not process a pre-game state", async () => {
      const game = makeGame({ gameState: "PRE" as "FUT" });

      await setupLiveData(game);

      expect(mockNHLDB.setCurrentGame).not.toHaveBeenCalled();
    });
  });

  describe("GameStartTask already active", () => {
    it("should still update DB even if GameStartTask is active for FUT game", async () => {
      mockGameStartTaskIsActive = true;
      const futureTime = new Date(Date.now() + 3_600_000);
      const game = makeGame({ gameState: "FUT", startTimeUTC: futureTime.toISOString() });

      await setupLiveData(game);

      // DB should be updated regardless
      expect(mockNHLDB.setCurrentGame).toHaveBeenCalledWith(game.id, futureTime);
      // But should not set new date
      expect(mockGameStartTask.setDate).not.toHaveBeenCalled();
    });

    it("should not start LiveDataTask on startup if GameStartTask is already active", async () => {
      mockGameStartTaskIsActive = true;
      const pastStartTime = new Date(Date.now() - 5 * 60_000);
      const game = makeGame({ gameState: "LIVE", startTimeUTC: pastStartTime.toISOString() });

      await setupLiveData(game, true);

      expect(mockLiveDataTask.createScheduledJob).not.toHaveBeenCalled();
    });
  });

  describe("setCurrentGame parameters", () => {
    it("should pass the correct gameId and gameStartTime to setCurrentGame", async () => {
      const gameStartTime = new Date("2024-11-15T23:00:00.000Z");
      const game = makeGame({ id: 9999, gameState: "FUT", startTimeUTC: gameStartTime.toISOString() });

      await setupLiveData(game);

      expect(mockNHLDB.setCurrentGame).toHaveBeenCalledWith(9999, gameStartTime);
    });
  });
});