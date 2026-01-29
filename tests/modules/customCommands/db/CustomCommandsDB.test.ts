// Mock the database BEFORE any imports that use it
jest.mock("@common/db/db", () => {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const mockDb: any = {
    select: jest.fn().mockReturnThis(),
    insert: jest.fn().mockReturnThis(),
    update: jest.fn().mockReturnThis(),
    delete: jest.fn().mockReturnThis(),
    from: jest.fn().mockReturnThis(),
    where: jest.fn().mockReturnThis(),
    limit: jest.fn().mockReturnThis(),
    values: jest.fn().mockReturnThis(),
    execute: jest.fn().mockResolvedValue([]),
    $client: jest.fn(),
  };

  return {
    __esModule: true,
    default: {
      getInstance: jest.fn(() => ({
        getDb: jest.fn(() => mockDb),
      })),
    },
  };
});

// Mock ConfigManager
jest.mock("@common/managers/ConfigManager", () => {
  return {
    __esModule: true,
    default: {
      getInstance: jest.fn(() => ({
        getConfig: jest.fn(() => ({
          prefix: "!",
        })),
        isLoaded: jest.fn(() => true),
      })),
    },
  };
});

import CustomCommandsDB from "@modules/customCommands/db/CustomCommandsDB";
import Database from "@common/db/db";
import CustomCommandsModule from "@modules/customCommands/CustomCommandsModule";

describe("CustomCommandsDB", () => {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  let mockDb: any;

  beforeEach(() => {
    // Initialize the module with test config
    CustomCommandsModule.getInstance();

    // Create a fresh mock database for each test
    mockDb = {
      select: jest.fn(),
      insert: jest.fn(),
      update: jest.fn(),
      delete: jest.fn(),
      execute: jest.fn(),
      $client: jest.fn(),
    };

    // Mock the Database singleton's getInstance and getDb methods
    (Database.getInstance as jest.Mock) = jest.fn().mockReturnValue({
      getDb: jest.fn().mockReturnValue(mockDb),
    });
  });

  describe("hasCommand", () => {
    it("should return true when command exists", async () => {
      // Mock the query chain: select().from().where().limit()
      mockDb.select.mockReturnValue({
        from: jest.fn().mockReturnValue({
          where: jest.fn().mockReturnValue({
            limit: jest.fn().mockResolvedValue([{ one: 1 }]),
          }),
        }),
      });

      const db = new CustomCommandsDB();
      const result = await db.hasCommand("testcommand");

      expect(result).toBe(true);
      expect(mockDb.select).toHaveBeenCalled();
    });

    it("should return false when command does not exist", async () => {
      // Mock the query chain with empty result
      mockDb.select.mockReturnValue({
        from: jest.fn().mockReturnValue({
          where: jest.fn().mockReturnValue({
            limit: jest.fn().mockResolvedValue([]),
          }),
        }),
      });

      const db = new CustomCommandsDB();
      const result = await db.hasCommand("nonexistent");

      expect(result).toBe(false);
    });
  });

  describe("getCommand", () => {
    it("should return command when it exists", async () => {
      const mockCommand = {
        id: 1,
        name: "testcommand",
        text: "test response",
        createdBy: "user123",
        createdOn: new Date(),
      };

      mockDb.select.mockReturnValue({
        from: jest.fn().mockReturnValue({
          where: jest.fn().mockResolvedValue([mockCommand]),
        }),
      });

      const db = new CustomCommandsDB();
      const result = await db.getCommand("testcommand");

      expect(result).toEqual(mockCommand);
    });

    it("should return undefined when command does not exist", async () => {
      mockDb.select.mockReturnValue({
        from: jest.fn().mockReturnValue({
          where: jest.fn().mockResolvedValue([]),
        }),
      });

      const db = new CustomCommandsDB();
      const result = await db.getCommand("nonexistent");

      expect(result).toBeUndefined();
    });
  });

  describe("getAllCommandNames", () => {
    it("should return array of command names", async () => {
      const mockCommands = [{ name: "cmd1" }, { name: "cmd2" }, { name: "cmd3" }];

      mockDb.select.mockReturnValue({
        from: jest.fn().mockResolvedValue(mockCommands),
      });

      const db = new CustomCommandsDB();
      const result = await db.getAllCommandNames();

      expect(result).toEqual(["cmd1", "cmd2", "cmd3"]);
      expect(mockDb.select).toHaveBeenCalled();
    });

    it("should return empty array when no commands exist", async () => {
      mockDb.select.mockReturnValue({
        from: jest.fn().mockResolvedValue([]),
      });

      const db = new CustomCommandsDB();
      const result = await db.getAllCommandNames();

      expect(result).toEqual([]);
    });
  });

  describe("getAllCommands", () => {
    it("should return all commands", async () => {
      const mockCommands = [
        {
          id: 1,
          name: "cmd1",
          text: "response1",
          createdBy: "user1",
          createdOn: new Date(),
        },
        {
          id: 2,
          name: "cmd2",
          text: "response2",
          createdBy: "user2",
          createdOn: new Date(),
        },
      ];

      mockDb.select.mockReturnValue({
        from: jest.fn().mockResolvedValue(mockCommands),
      });

      const db = new CustomCommandsDB();
      const result = await db.getAllCommands();

      expect(result).toEqual(mockCommands);
      expect(result.length).toBe(2);
    });
  });

  describe("addCommandSkippingUpload", () => {
    it("should add a command when it does not exist", async () => {
      const newCommand = {
        id: 1,
        name: "newcmd",
        text: "new response",
        createdBy: "user123",
        createdOn: new Date(),
      };

      // Mock hasCommand to return false (command doesn't exist)
      mockDb.select.mockReturnValueOnce({
        from: jest.fn().mockReturnValue({
          where: jest.fn().mockReturnValue({
            limit: jest.fn().mockResolvedValue([]),
          }),
        }),
      });

      // Mock insert().values().returning()
      mockDb.insert.mockReturnValue({
        values: jest.fn().mockReturnValue({
          returning: jest.fn().mockResolvedValue([newCommand]),
        }),
      });

      // Mock createAuditLog (from parent class)
      const db = new CustomCommandsDB();
      db.createAuditLog = jest.fn().mockResolvedValue(undefined);

      // Mock updateCommandList
      db.updateCommandList = jest.fn().mockResolvedValue(undefined);

      // Mock getAllCommands for updateCommandList
      mockDb.select.mockReturnValueOnce({
        from: jest.fn().mockResolvedValue([newCommand]),
      });

      const result = await db.addCommandSkippingUpload("newcmd", "new response", "user123");

      expect(result).toBe(true);
      expect(mockDb.insert).toHaveBeenCalled();
    });

    it("should return false when command already exists", async () => {
      // Mock hasCommand to return true (command exists)
      mockDb.select.mockReturnValueOnce({
        from: jest.fn().mockReturnValue({
          where: jest.fn().mockReturnValue({
            limit: jest.fn().mockResolvedValue([{ one: 1 }]),
          }),
        }),
      });

      const db = new CustomCommandsDB();
      const result = await db.addCommandSkippingUpload("existingcmd", "text", "user123");

      expect(result).toBe(false);
      expect(mockDb.insert).not.toHaveBeenCalled();
    });
  });

  describe("removeCommand", () => {
    it("should remove a command when it exists", async () => {
      const existingCommand = {
        id: 1,
        name: "cmdtoremove",
        text: "some text",
        createdBy: "user123",
        createdOn: new Date(),
      };

      // Mock hasCommand to return true
      mockDb.select.mockReturnValueOnce({
        from: jest.fn().mockReturnValue({
          where: jest.fn().mockReturnValue({
            limit: jest.fn().mockResolvedValue([{ one: 1 }]),
          }),
        }),
      });

      // Mock getCommand
      mockDb.select.mockReturnValueOnce({
        from: jest.fn().mockReturnValue({
          where: jest.fn().mockResolvedValue([existingCommand]),
        }),
      });

      // Mock delete().where()
      mockDb.delete.mockReturnValue({
        where: jest.fn().mockResolvedValue(undefined),
      });

      const db = new CustomCommandsDB();
      db.createAuditLog = jest.fn().mockResolvedValue(undefined);
      db.updateCommandList = jest.fn().mockResolvedValue(undefined);

      // Mock getAllCommands for updateCommandList
      mockDb.select.mockReturnValueOnce({
        from: jest.fn().mockResolvedValue([]),
      });

      const result = await db.removeCommand("cmdtoremove", "user123");

      expect(result).toBe(true);
      expect(mockDb.delete).toHaveBeenCalled();
    });

    it("should return false when command does not exist", async () => {
      // Mock hasCommand to return false
      mockDb.select.mockReturnValueOnce({
        from: jest.fn().mockReturnValue({
          where: jest.fn().mockReturnValue({
            limit: jest.fn().mockResolvedValue([]),
          }),
        }),
      });

      const db = new CustomCommandsDB();
      const result = await db.removeCommand("nonexistent", "user123");

      expect(result).toBe(false);
      expect(mockDb.delete).not.toHaveBeenCalled();
    });
  });

  describe("getCommandListMessageIds", () => {
    it("should return array of message IDs", async () => {
      const mockMessageIds = ["msg1", "msg2", "msg3"];

      mockDb.select.mockReturnValue({
        from: jest.fn().mockReturnValue({
          where: jest.fn().mockResolvedValue([{ commandListMessageIds: mockMessageIds }]),
        }),
      });

      const db = new CustomCommandsDB();
      const result = await db.getCommandListMessageIds();

      expect(result).toEqual(mockMessageIds);
    });
  });

  describe("removeAllCommandListMessageIds", () => {
    it("should clear all message IDs", async () => {
      mockDb.update.mockReturnValue({
        set: jest.fn().mockReturnValue({
          where: jest.fn().mockResolvedValue(undefined),
        }),
      });

      const db = new CustomCommandsDB();
      await db.removeAllCommandListMessageIds();

      expect(mockDb.update).toHaveBeenCalled();
    });
  });

  describe("addCommandListMessageId", () => {
    it("should add a message ID to the array", async () => {
      mockDb.update.mockReturnValue({
        set: jest.fn().mockReturnValue({
          where: jest.fn().mockResolvedValue(undefined),
        }),
      });

      const db = new CustomCommandsDB();
      await db.addCommandListMessageId("newmsgid");

      expect(mockDb.update).toHaveBeenCalled();
    });
  });

  describe("removeCommandListMessageId", () => {
    it("should remove a specific message ID from the array", async () => {
      mockDb.update.mockReturnValue({
        set: jest.fn().mockReturnValue({
          where: jest.fn().mockResolvedValue(undefined),
        }),
      });

      const db = new CustomCommandsDB();
      await db.removeCommandListMessageId("msgtoremove");

      expect(mockDb.update).toHaveBeenCalled();
    });
  });
});
