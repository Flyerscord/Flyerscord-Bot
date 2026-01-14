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

import JoinLeaveDB from "@modules/joinLeave/db/JoinLeaveDB";
import { notVerifiedUsers } from "@modules/joinLeave/db/schema";
import DbManager from "@common/db/db";

describe("JoinLeaveDB", () => {
  let db: JoinLeaveDB;
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

    db = new JoinLeaveDB();
  });

  describe("addNotVerifiedUser", () => {
    it("should insert a new not verified user", async () => {
      const userId = "user-123";
      const mockValues = jest.fn().mockResolvedValue(undefined);

      mockDbInstance.insert.mockReturnValue({
        values: mockValues,
      });

      await db.addNotVerifiedUser(userId);

      expect(mockDbInstance.insert).toHaveBeenCalledWith(notVerifiedUsers);
      expect(mockValues).toHaveBeenCalledWith({ userId });
    });

    it("should handle multiple user additions", async () => {
      const mockValues = jest.fn().mockResolvedValue(undefined);
      mockDbInstance.insert.mockReturnValue({
        values: mockValues,
      });

      await db.addNotVerifiedUser("user-1");
      await db.addNotVerifiedUser("user-2");
      await db.addNotVerifiedUser("user-3");

      expect(mockDbInstance.insert).toHaveBeenCalledTimes(3);
      expect(mockValues).toHaveBeenCalledWith({ userId: "user-1" });
      expect(mockValues).toHaveBeenCalledWith({ userId: "user-2" });
      expect(mockValues).toHaveBeenCalledWith({ userId: "user-3" });
    });
  });

  describe("deleteNotVerifiedUser", () => {
    it("should delete a not verified user by userId", async () => {
      const userId = "user-123";
      const mockWhere = jest.fn().mockResolvedValue(undefined);

      mockDbInstance.delete.mockReturnValue({
        where: mockWhere,
      });

      await db.deleteNotVerifiedUser(userId);

      expect(mockDbInstance.delete).toHaveBeenCalledWith(notVerifiedUsers);
      expect(mockWhere).toHaveBeenCalled();
    });

    it("should handle deletion of non-existent user gracefully", async () => {
      const userId = "non-existent-user";
      const mockWhere = jest.fn().mockResolvedValue(undefined);

      mockDbInstance.delete.mockReturnValue({
        where: mockWhere,
      });

      await expect(db.deleteNotVerifiedUser(userId)).resolves.not.toThrow();
    });
  });

  describe("getNotVerifiedUsers", () => {
    it("should return all not verified users", async () => {
      const mockUsers = [
        { userId: "user-1", questionsAnswered: 0, addedAt: new Date(), lock: false },
        { userId: "user-2", questionsAnswered: 1, addedAt: new Date(), lock: false },
        { userId: "user-3", questionsAnswered: 2, addedAt: new Date(), lock: true },
      ];

      const mockFrom = jest.fn().mockResolvedValue(mockUsers);
      mockDbInstance.select.mockReturnValue({
        from: mockFrom,
      });

      const result = await db.getNotVerifiedUsers();

      expect(mockDbInstance.select).toHaveBeenCalled();
      expect(mockFrom).toHaveBeenCalledWith(notVerifiedUsers);
      expect(result).toEqual(mockUsers);
    });

    it("should return empty array when no users exist", async () => {
      const mockFrom = jest.fn().mockResolvedValue([]);
      mockDbInstance.select.mockReturnValue({
        from: mockFrom,
      });

      const result = await db.getNotVerifiedUsers();

      expect(result).toEqual([]);
    });
  });

  describe("getNotVerifiedUser", () => {
    it("should return a single not verified user by userId", async () => {
      const userId = "user-123";
      const mockUser = {
        userId,
        questionsAnswered: 1,
        addedAt: new Date(),
        lock: false,
      };

      // Mock the getSingleRow method from ModuleDatabase
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      jest.spyOn(db as any, "getSingleRow").mockResolvedValue(mockUser);

      const result = await db.getNotVerifiedUser(userId);

      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      expect((db as any).getSingleRow).toHaveBeenCalledWith(
        notVerifiedUsers,
        expect.anything(), // eq() matcher
      );
      expect(result).toEqual(mockUser);
    });

    it("should return undefined when user does not exist", async () => {
      const userId = "non-existent-user";

      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      jest.spyOn(db as any, "getSingleRow").mockResolvedValue(undefined);

      const result = await db.getNotVerifiedUser(userId);

      expect(result).toBeUndefined();
    });

    it("should handle locked users correctly", async () => {
      const userId = "locked-user";
      const mockUser = {
        userId,
        questionsAnswered: 0,
        addedAt: new Date(),
        lock: true,
      };

      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      jest.spyOn(db as any, "getSingleRow").mockResolvedValue(mockUser);

      const result = await db.getNotVerifiedUser(userId);

      expect(result).toEqual(mockUser);
      expect(result?.lock).toBe(true);
    });
  });

  describe("incrementQuestionsAnswered", () => {
    it("should increment questionsAnswered for a user", async () => {
      const userId = "user-123";
      const mockWhere = jest.fn().mockResolvedValue(undefined);
      const mockSet = jest.fn().mockReturnValue({ where: mockWhere });

      mockDbInstance.update.mockReturnValue({
        set: mockSet,
      });

      // Mock the increment method
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      jest.spyOn(db as any, "increment").mockReturnValue("INCREMENTED_VALUE");

      await db.incrementQuestionsAnswered(userId);

      expect(mockDbInstance.update).toHaveBeenCalledWith(notVerifiedUsers);
      expect(mockSet).toHaveBeenCalledWith({
        questionsAnswered: "INCREMENTED_VALUE",
      });
      expect(mockWhere).toHaveBeenCalled();
    });

    it("should handle incrementing for multiple users", async () => {
      const mockWhere = jest.fn().mockResolvedValue(undefined);
      const mockSet = jest.fn().mockReturnValue({ where: mockWhere });

      mockDbInstance.update.mockReturnValue({
        set: mockSet,
      });

      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      jest.spyOn(db as any, "increment").mockReturnValue("INCREMENTED_VALUE");

      await db.incrementQuestionsAnswered("user-1");
      await db.incrementQuestionsAnswered("user-2");

      expect(mockDbInstance.update).toHaveBeenCalledTimes(2);
    });
  });

  describe("lockUser", () => {
    it("should set lock to true for a user", async () => {
      const userId = "user-123";
      const mockWhere = jest.fn().mockResolvedValue(undefined);
      const mockSet = jest.fn().mockReturnValue({ where: mockWhere });

      mockDbInstance.update.mockReturnValue({
        set: mockSet,
      });

      await db.lockUser(userId);

      expect(mockDbInstance.update).toHaveBeenCalledWith(notVerifiedUsers);
      expect(mockSet).toHaveBeenCalledWith({ lock: true });
      expect(mockWhere).toHaveBeenCalled();
    });

    it("should handle locking already locked user", async () => {
      const userId = "user-123";
      const mockWhere = jest.fn().mockResolvedValue(undefined);
      const mockSet = jest.fn().mockReturnValue({ where: mockWhere });

      mockDbInstance.update.mockReturnValue({
        set: mockSet,
      });

      await db.lockUser(userId);
      await db.lockUser(userId);

      expect(mockDbInstance.update).toHaveBeenCalledTimes(2);
      expect(mockSet).toHaveBeenCalledWith({ lock: true });
    });
  });

  describe("unlockUser", () => {
    it("should set lock to false for a user", async () => {
      const userId = "user-123";
      const mockWhere = jest.fn().mockResolvedValue(undefined);
      const mockSet = jest.fn().mockReturnValue({ where: mockWhere });

      mockDbInstance.update.mockReturnValue({
        set: mockSet,
      });

      await db.unlockUser(userId);

      expect(mockDbInstance.update).toHaveBeenCalledWith(notVerifiedUsers);
      expect(mockSet).toHaveBeenCalledWith({ lock: false });
      expect(mockWhere).toHaveBeenCalled();
    });

    it("should handle unlocking already unlocked user", async () => {
      const userId = "user-123";
      const mockWhere = jest.fn().mockResolvedValue(undefined);
      const mockSet = jest.fn().mockReturnValue({ where: mockWhere });

      mockDbInstance.update.mockReturnValue({
        set: mockSet,
      });

      await db.unlockUser(userId);
      await db.unlockUser(userId);

      expect(mockDbInstance.update).toHaveBeenCalledTimes(2);
      expect(mockSet).toHaveBeenCalledWith({ lock: false });
    });
  });

  describe("lock/unlock workflow", () => {
    it("should support lock and unlock in sequence", async () => {
      const userId = "user-123";
      const mockWhere = jest.fn().mockResolvedValue(undefined);
      const mockSet = jest.fn().mockReturnValue({ where: mockWhere });

      mockDbInstance.update.mockReturnValue({
        set: mockSet,
      });

      await db.lockUser(userId);
      await db.unlockUser(userId);

      expect(mockSet).toHaveBeenNthCalledWith(1, { lock: true });
      expect(mockSet).toHaveBeenNthCalledWith(2, { lock: false });
    });
  });

  describe("integration scenarios", () => {
    it("should support complete user verification flow", async () => {
      const userId = "user-123";
      const mockValues = jest.fn().mockResolvedValue(undefined);
      const mockWhere = jest.fn().mockResolvedValue(undefined);
      const mockSet = jest.fn().mockReturnValue({ where: mockWhere });

      mockDbInstance.insert.mockReturnValue({ values: mockValues });
      mockDbInstance.update.mockReturnValue({ set: mockSet });
      mockDbInstance.delete.mockReturnValue({ where: mockWhere });

      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      jest.spyOn(db as any, "increment").mockReturnValue("INCREMENTED_VALUE");

      // Add user
      await db.addNotVerifiedUser(userId);

      // Lock user
      await db.lockUser(userId);

      // Increment questions answered
      await db.incrementQuestionsAnswered(userId);

      // Unlock user
      await db.unlockUser(userId);

      // Delete user after verification
      await db.deleteNotVerifiedUser(userId);

      expect(mockDbInstance.insert).toHaveBeenCalledTimes(1);
      expect(mockDbInstance.update).toHaveBeenCalledTimes(3);
      expect(mockDbInstance.delete).toHaveBeenCalledTimes(1);
    });
  });
});
