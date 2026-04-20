// Mock dependencies before imports

const mockStumper = {
  error: jest.fn(),
  warning: jest.fn(),
  caughtError: jest.fn(),
  success: jest.fn(),
  info: jest.fn(),
  debug: jest.fn(),
};

jest.mock("stumper", () => mockStumper);

// Mock setupLiveData
const mockSetupLiveData = jest.fn().mockResolvedValue(undefined);
jest.mock("@modules/nhl/utils/GameChecker", () => ({
  __esModule: true,
  setupLiveData: mockSetupLiveData,
  checkForGameDay: jest.fn().mockResolvedValue(undefined),
  closeAndLockOldPosts: jest.fn().mockResolvedValue(undefined),
}));

// Mock nhl-api-wrapper-ts
const mockGetCurrentTeamSchedule = jest.fn();
jest.mock("nhl-api-wrapper-ts", () => ({
  __esModule: true,
  default: {
    teams: {
      schedule: {
        getCurrentTeamSchedule: mockGetCurrentTeamSchedule,
      },
    },
  },
  TEAM_TRI_CODE: {
    PHILADELPHIA_FLYERS: "PHI",
  },
}));

// Mock Time utility
const mockIsSameDay = jest.fn().mockReturnValue(false);
jest.mock("@common/utils/Time", () => ({
  __esModule: true,
  default: {
    isSameDay: mockIsSameDay,
  },
}));

// Mock ClientManager
type ClientReadyListener = (args: unknown) => Promise<void>;
let capturedClientReadyListener: ClientReadyListener | undefined;

const mockClient = {
  on: jest.fn().mockImplementation((event: string, listener: ClientReadyListener) => {
    if (event === "clientReady") {
      capturedClientReadyListener = listener;
    }
  }),
};

jest.mock("@common/managers/ClientManager", () => ({
  __esModule: true,
  default: {
    getInstance: jest.fn(() => ({
      client: mockClient,
    })),
  },
}));

import onReady from "@modules/nhl/listeners/onReady";
import { IClubScheduleOutput_games } from "nhl-api-wrapper-ts/dist/interfaces/club/schedule/ClubSchedule";

// Helper to build a minimal game object
function makeGame(overrides: Partial<IClubScheduleOutput_games> = {}): IClubScheduleOutput_games {
  return {
    id: 2024123456,
    startTimeUTC: new Date(Date.now() + 3_600_000).toISOString(),
    gameState: "FUT",
    gameType: 2,
    season: 20242025,
    homeTeam: { id: 4 } as IClubScheduleOutput_games["homeTeam"],
    awayTeam: { id: 10 } as IClubScheduleOutput_games["awayTeam"],
    ...overrides,
  } as IClubScheduleOutput_games;
}

describe("onReady listener (NHL module)", () => {
  beforeEach(() => {
    jest.clearAllMocks();
    capturedClientReadyListener = undefined;
  });

  describe("onReady registration", () => {
    it("should register a clientReady event listener", () => {
      onReady();

      expect(mockClient.on).toHaveBeenCalledWith("clientReady", expect.any(Function));
    });

    it("should register exactly one listener", () => {
      onReady();

      expect(mockClient.on).toHaveBeenCalledTimes(1);
    });
  });

  describe("clientReady event handler", () => {
    it("should call getCurrentTeamSchedule for the Philadelphia Flyers", async () => {
      mockGetCurrentTeamSchedule.mockResolvedValue({ status: 200, data: { games: [] } });

      onReady();
      await capturedClientReadyListener!(undefined);

      expect(mockGetCurrentTeamSchedule).toHaveBeenCalledWith({
        team: expect.anything(), // PHILADELPHIA_FLYERS constant
      });
    });

    it("should not call setupLiveData when no game is scheduled today", async () => {
      mockGetCurrentTeamSchedule.mockResolvedValue({
        status: 200,
        data: { games: [makeGame()] },
      });
      mockIsSameDay.mockReturnValue(false); // No games today

      onReady();
      await capturedClientReadyListener!(undefined);

      expect(mockSetupLiveData).not.toHaveBeenCalled();
    });

    it("should call setupLiveData with onStartup=true when a game is found today", async () => {
      const todayGame = makeGame();
      mockGetCurrentTeamSchedule.mockResolvedValue({
        status: 200,
        data: {
          games: [todayGame],
        },
      });
      mockIsSameDay.mockReturnValue(true); // Game is today

      onReady();
      await capturedClientReadyListener!(undefined);

      expect(mockSetupLiveData).toHaveBeenCalledWith(todayGame, true);
    });

    it("should call setupLiveData only for the game matching today", async () => {
      const game1 = makeGame({ id: 111, startTimeUTC: new Date(Date.now() - 86_400_000).toISOString() });
      const game2 = makeGame({ id: 222, startTimeUTC: new Date().toISOString() });
      const game3 = makeGame({ id: 333, startTimeUTC: new Date(Date.now() + 86_400_000).toISOString() });

      mockGetCurrentTeamSchedule.mockResolvedValue({
        status: 200,
        data: { games: [game1, game2, game3] },
      });
      // Only game2 is today
      mockIsSameDay.mockImplementation((_date1: Date, date2: Date) => {
        return date2.getTime() >= game2.startTimeUTC.length && date2.toISOString() === game2.startTimeUTC;
      });

      // Simplified: make isSameDay return true only for game2
      let callCount = 0;
      mockIsSameDay.mockImplementation(() => {
        callCount++;
        return callCount === 2; // Return true for the second game (game2)
      });

      onReady();
      await capturedClientReadyListener!(undefined);

      expect(mockSetupLiveData).toHaveBeenCalledTimes(1);
      expect(mockSetupLiveData).toHaveBeenCalledWith(game2, true);
    });

    it("should not call setupLiveData when API returns non-200 status", async () => {
      mockGetCurrentTeamSchedule.mockResolvedValue({
        status: 500,
        data: null,
      });

      onReady();
      await capturedClientReadyListener!(undefined);

      expect(mockSetupLiveData).not.toHaveBeenCalled();
    });

    it("should not call setupLiveData when API returns empty games list", async () => {
      mockGetCurrentTeamSchedule.mockResolvedValue({
        status: 200,
        data: { games: [] },
      });

      onReady();
      await capturedClientReadyListener!(undefined);

      expect(mockSetupLiveData).not.toHaveBeenCalled();
    });

    it("should handle a LIVE game today (passed to setupLiveData with onStartup=true)", async () => {
      const liveGame = makeGame({ gameState: "LIVE" });
      mockGetCurrentTeamSchedule.mockResolvedValue({
        status: 200,
        data: { games: [liveGame] },
      });
      mockIsSameDay.mockReturnValue(true);

      onReady();
      await capturedClientReadyListener!(undefined);

      expect(mockSetupLiveData).toHaveBeenCalledWith(liveGame, true);
    });
  });
});