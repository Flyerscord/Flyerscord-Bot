// Mock the database BEFORE any imports that use it
jest.mock("@common/db/db", () => {
  return {
    __esModule: true,
    default: {
      getInstance: jest.fn(() => ({
        getDb: jest.fn(),
      })),
    },
  };
});

import BlueSkyDB, { BlueSkyActionType } from "@modules/bluesky/db/BlueSkyDB";
import { blueSkyState } from "@modules/bluesky/db/schema";
import DbManager from "@common/db/db";

describe("BlueSkyDB", () => {
  let db: BlueSkyDB;
  let mockDbInstance: {
    insert: jest.Mock;
    delete: jest.Mock;
    select: jest.Mock;
    update: jest.Mock;
  };

  beforeEach(() => {
    jest.clearAllMocks();

    // Create chainable mock database
    mockDbInstance = {
      insert: jest.fn().mockReturnThis(),
      delete: jest.fn().mockReturnThis(),
      select: jest.fn().mockReturnThis(),
      update: jest.fn().mockReturnThis(),
    };

    // Setup DbManager mock
    (DbManager.getInstance as jest.Mock).mockReturnValue({
      getDb: jest.fn().mockReturnValue(mockDbInstance),
    });

    db = new BlueSkyDB();
  });

  describe("constructor", () => {
    it("should create BlueSkyDB instance with correct module name", () => {
      expect(db).toBeInstanceOf(BlueSkyDB);
    });
  });

  describe("addAuditLog", () => {
    it("should create audit log with ADD action type", async () => {
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      jest.spyOn(db as any, "createAuditLog").mockResolvedValue(undefined);

      await db.addAuditLog(BlueSkyActionType.ADD, "user123", { account: "testaccount.bsky.social" });

      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      expect((db as any).createAuditLog).toHaveBeenCalledWith({
        action: BlueSkyActionType.ADD,
        userId: "user123",
        details: { account: "testaccount.bsky.social" },
      });
    });

    it("should create audit log with REMOVE action type", async () => {
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      jest.spyOn(db as any, "createAuditLog").mockResolvedValue(undefined);

      await db.addAuditLog(BlueSkyActionType.REMOVE, "user456", { account: "removed.bsky.social" });

      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      expect((db as any).createAuditLog).toHaveBeenCalledWith({
        action: BlueSkyActionType.REMOVE,
        userId: "user456",
        details: { account: "removed.bsky.social" },
      });
    });
  });

  describe("updateLastPostTime", () => {
    it("should insert or update last post time using upsert", async () => {
      const newPostTime = new Date("2024-01-15T12:00:00Z");
      const mockOnConflictDoUpdate = jest.fn().mockResolvedValue(undefined);
      const mockValues = jest.fn().mockReturnValue({
        onConflictDoUpdate: mockOnConflictDoUpdate,
      });

      mockDbInstance.insert.mockReturnValue({
        values: mockValues,
      });

      await db.updateLastPostTime(newPostTime);

      expect(mockDbInstance.insert).toHaveBeenCalledWith(blueSkyState);
      expect(mockValues).toHaveBeenCalledWith(
        expect.objectContaining({
          key: "lastPostTimeId",
          date: newPostTime,
        }),
      );
      expect(mockOnConflictDoUpdate).toHaveBeenCalledWith({
        target: blueSkyState.key,
        set: expect.objectContaining({
          date: newPostTime,
        }),
      });
    });

    it("should include updatedAt timestamp", async () => {
      const newPostTime = new Date("2024-01-15T12:00:00Z");
      const mockOnConflictDoUpdate = jest.fn().mockResolvedValue(undefined);
      const mockValues = jest.fn().mockReturnValue({
        onConflictDoUpdate: mockOnConflictDoUpdate,
      });

      mockDbInstance.insert.mockReturnValue({
        values: mockValues,
      });

      await db.updateLastPostTime(newPostTime);

      expect(mockValues).toHaveBeenCalledWith(
        expect.objectContaining({
          updatedAt: expect.any(Date),
        }),
      );
    });
  });

  describe("getLastPostTime", () => {
    it("should return last post time when it exists", async () => {
      const lastPostTime = new Date("2024-01-15T12:00:00Z");
      const mockWhere = jest.fn().mockResolvedValue([{ date: lastPostTime }]);
      const mockFrom = jest.fn().mockReturnValue({
        where: mockWhere,
      });

      mockDbInstance.select.mockReturnValue({
        from: mockFrom,
      });

      const result = await db.getLastPostTime();

      expect(mockDbInstance.select).toHaveBeenCalledWith({ date: blueSkyState.date });
      expect(mockFrom).toHaveBeenCalledWith(blueSkyState);
      expect(result).toEqual(lastPostTime);
    });

    it("should return undefined when no records exist", async () => {
      const mockWhere = jest.fn().mockResolvedValue([]);
      const mockFrom = jest.fn().mockReturnValue({
        where: mockWhere,
      });

      mockDbInstance.select.mockReturnValue({
        from: mockFrom,
      });

      const result = await db.getLastPostTime();

      expect(result).toBeUndefined();
    });

    it("should return undefined when date is null", async () => {
      const mockWhere = jest.fn().mockResolvedValue([{ date: null }]);
      const mockFrom = jest.fn().mockReturnValue({
        where: mockWhere,
      });

      mockDbInstance.select.mockReturnValue({
        from: mockFrom,
      });

      const result = await db.getLastPostTime();

      expect(result).toBeUndefined();
    });
  });

  describe("BlueSkyActionType enum", () => {
    it("should have ADD action type", () => {
      expect(BlueSkyActionType.ADD).toBe("ADD");
    });

    it("should have REMOVE action type", () => {
      expect(BlueSkyActionType.REMOVE).toBe("REMOVE");
    });
  });
});
