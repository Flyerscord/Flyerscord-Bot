import CustomCommandsDB from "@modules/customCommands/db/CustomCommandsDB";
import Database from "@common/db/db";
import CustomCommandsModule from "@modules/customCommands/CustomCommandsModule";

// Mock the Database singleton
jest.mock("@common/db/db");

describe("CustomCommandsDB", () => {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  let mockDb: any;

  beforeEach(() => {
    // Initialize the module with test config
    CustomCommandsModule.getInstance({
      customcommands: {
        prefix: "!",
        commandTempChannelId: "",
        customCommandListChannelId: "",
        imageKit: {
          publicKey: "",
          privateKey: "",
          urlEndpoint: "",
          redirectUrl: "",
          proxyUrl: "",
        },
        imgur: {
          clientId: "",
          clientSecret: "",
        },
      },
    });

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
});
