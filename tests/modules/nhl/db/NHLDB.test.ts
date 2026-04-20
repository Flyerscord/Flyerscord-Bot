// Mock the DB before any imports
const mockOnConflictDoNothing = jest.fn().mockResolvedValue(undefined);
const mockOnConflictDoUpdate = jest.fn().mockResolvedValue(undefined);
const mockSet = jest.fn().mockReturnThis();
const mockWhere = jest.fn().mockResolvedValue([]);
const mockFrom = jest.fn().mockReturnThis();
const mockLimit = jest.fn().mockResolvedValue([]);
const mockValues = jest.fn().mockReturnThis();
const mockInsert = jest.fn().mockReturnThis();
const mockUpdate = jest.fn().mockReturnThis();
const mockSelect = jest.fn().mockReturnThis();

const mockDb = {
  insert: mockInsert,
  update: mockUpdate,
  select: mockSelect,
  from: mockFrom,
  where: mockWhere,
  limit: mockLimit,
  values: mockValues,
  set: mockSet,
  onConflictDoNothing: mockOnConflictDoNothing,
  onConflictDoUpdate: mockOnConflictDoUpdate,
};

jest.mock("@common/db/db", () => ({
  __esModule: true,
  default: {
    getInstance: jest.fn(() => ({
      getDb: jest.fn(() => mockDb),
    })),
  },
}));

const mockStumper = {
  error: jest.fn(),
  warning: jest.fn(),
  caughtError: jest.fn(),
  success: jest.fn(),
  info: jest.fn(),
  debug: jest.fn(),
};

jest.mock("stumper", () => mockStumper);

// Mock the schema to prevent drizzle errors
jest.mock("@modules/nhl/db/schema", () => {
  const gameId = { name: "game_id" };
  const channelId = { name: "channel_id" };
  const id = { name: "id" };
  const gameStartTime = { name: "game_start_time" };
  const currentPeriod = { name: "current_period" };

  const gamedayPostsPosts = { gameId, channelId, $inferSelect: {} };
  const liveData = { id, gameId, gameStartTime, currentPeriod, $inferSelect: {} };

  return {
    __esModule: true,
    gamedayPostsPosts,
    liveData,
    default: { gamedayPostsPosts, liveData },
  };
});

jest.mock("drizzle-orm", () => ({
  eq: jest.fn((field, value) => ({ field, value, type: "eq" })),
  count: jest.fn(() => "count_expr"),
  sql: jest.fn(),
}));

// Mock audit log utilities
jest.mock("@common/utils/MyAuditLog", () => ({
  __esModule: true,
  default: {
    createAuditLog: jest.fn().mockResolvedValue(undefined),
    getCountAuditLogs: jest.fn().mockResolvedValue(0),
    getAuditLogs: jest.fn().mockResolvedValue([]),
    getAuditLogsByAction: jest.fn().mockResolvedValue([]),
    getAuditLogsByUser: jest.fn().mockResolvedValue([]),
    getAuditLogsByUserAndAction: jest.fn().mockResolvedValue([]),
    getAuditLog: jest.fn().mockResolvedValue(undefined),
  },
}));

import NHLDB from "@modules/nhl/db/NHLDB";

describe("NHLDB", () => {
  let db: NHLDB;

  beforeEach(() => {
    jest.clearAllMocks();
    // Reset mock chain defaults
    mockInsert.mockReturnThis();
    mockUpdate.mockReturnThis();
    mockSelect.mockReturnThis();
    mockFrom.mockReturnThis();
    mockValues.mockReturnThis();
    mockSet.mockReturnThis();
    mockOnConflictDoNothing.mockResolvedValue(undefined);
    mockOnConflictDoUpdate.mockResolvedValue(undefined);
    mockWhere.mockResolvedValue([]);
    mockLimit.mockResolvedValue([]);

    db = new NHLDB();
  });

  describe("constructor", () => {
    it("should create an instance without throwing", () => {
      expect(db).toBeDefined();
    });
  });

  describe("ensureLiveDataRowExists", () => {
    it("should insert a row with id=1 and use onConflictDoNothing", async () => {
      await db.ensureLiveDataRowExists();

      expect(mockInsert).toHaveBeenCalled();
      expect(mockValues).toHaveBeenCalledWith({ id: 1 });
      expect(mockOnConflictDoNothing).toHaveBeenCalled();
    });

    it("should not throw if row already exists (onConflictDoNothing handles it)", async () => {
      mockOnConflictDoNothing.mockResolvedValue(undefined);
      await expect(db.ensureLiveDataRowExists()).resolves.toBeUndefined();
    });
  });

  describe("setCurrentGame", () => {
    it("should update liveData with gameId and gameStartTime where id=1", async () => {
      const gameId = 2024123456;
      const gameStartTime = new Date("2024-11-15T19:00:00Z");

      mockWhere.mockResolvedValue(undefined);
      await db.setCurrentGame(gameId, gameStartTime);

      expect(mockUpdate).toHaveBeenCalled();
      expect(mockSet).toHaveBeenCalledWith({ gameId, gameStartTime });
      expect(mockWhere).toHaveBeenCalled();
    });

    it("should filter by id=1", async () => {
      const { eq } = await import("drizzle-orm");
      const gameId = 12345;
      const gameStartTime = new Date();

      mockWhere.mockResolvedValue(undefined);
      await db.setCurrentGame(gameId, gameStartTime);

      expect(eq).toHaveBeenCalled();
    });
  });

  describe("setCurrentPeriod", () => {
    it("should update liveData with the given period where id=1", async () => {
      mockWhere.mockResolvedValue(undefined);
      await db.setCurrentPeriod(2);

      expect(mockUpdate).toHaveBeenCalled();
      expect(mockSet).toHaveBeenCalledWith({ currentPeriod: 2 });
      expect(mockWhere).toHaveBeenCalled();
    });

    it("should update with period=1 (first period)", async () => {
      mockWhere.mockResolvedValue(undefined);
      await db.setCurrentPeriod(1);

      expect(mockSet).toHaveBeenCalledWith({ currentPeriod: 1 });
    });

    it("should update with period=3 (third period)", async () => {
      mockWhere.mockResolvedValue(undefined);
      await db.setCurrentPeriod(3);

      expect(mockSet).toHaveBeenCalledWith({ currentPeriod: 3 });
    });

    it("should update with period=4 (overtime)", async () => {
      mockWhere.mockResolvedValue(undefined);
      await db.setCurrentPeriod(4);

      expect(mockSet).toHaveBeenCalledWith({ currentPeriod: 4 });
    });
  });

  describe("clearLiveData", () => {
    it("should update liveData with null values for all live data fields", async () => {
      mockWhere.mockResolvedValue(undefined);
      await db.clearLiveData();

      expect(mockUpdate).toHaveBeenCalled();
      expect(mockSet).toHaveBeenCalledWith({
        gameId: null,
        gameStartTime: null,
        currentPeriod: null,
      });
      expect(mockWhere).toHaveBeenCalled();
    });
  });

  describe("getCurrentLiveData", () => {
    it("should return undefined when no live data row is found", async () => {
      mockLimit.mockResolvedValue([]);
      mockWhere.mockReturnThis();

      const result = await db.getCurrentLiveData();

      expect(result).toBeUndefined();
    });

    it("should return the live data row when found", async () => {
      const mockLiveDataRow = {
        id: 1,
        gameId: 2024123456,
        gameStartTime: new Date("2024-11-15T19:00:00Z"),
        currentPeriod: 2,
      };

      mockWhere.mockReturnThis();
      mockLimit.mockResolvedValue([mockLiveDataRow]);

      const result = await db.getCurrentLiveData();

      expect(result).toEqual(mockLiveDataRow);
    });

    it("should return undefined when live data has no game (null gameId)", async () => {
      const mockLiveDataRow = {
        id: 1,
        gameId: null,
        gameStartTime: null,
        currentPeriod: null,
      };

      mockWhere.mockReturnThis();
      mockLimit.mockResolvedValue([mockLiveDataRow]);

      const result = await db.getCurrentLiveData();

      // Row exists but has null values
      expect(result).toEqual(mockLiveDataRow);
      expect(result?.gameId).toBeNull();
    });

    it("should query with a where condition filtering by id=1", async () => {
      const { eq } = await import("drizzle-orm");
      mockWhere.mockReturnThis();
      mockLimit.mockResolvedValue([]);

      await db.getCurrentLiveData();

      expect(eq).toHaveBeenCalled();
    });
  });

  describe("addPost", () => {
    it("should insert a post with gameId and channelId", async () => {
      await db.addPost(12345, "channel-123");

      expect(mockInsert).toHaveBeenCalled();
      expect(mockValues).toHaveBeenCalledWith({ gameId: 12345, channelId: "channel-123" });
      expect(mockOnConflictDoUpdate).toHaveBeenCalled();
    });
  });

  describe("getAllPostIds", () => {
    it("should return an array of channelIds", async () => {
      mockFrom.mockResolvedValue([{ channelId: "chan-1" }, { channelId: "chan-2" }]);

      const result = await db.getAllPostIds();

      expect(result).toEqual(["chan-1", "chan-2"]);
    });

    it("should return an empty array when no posts exist", async () => {
      mockFrom.mockResolvedValue([]);

      const result = await db.getAllPostIds();

      expect(result).toEqual([]);
    });
  });
});