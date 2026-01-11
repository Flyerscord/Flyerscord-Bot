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

import ICustomCommand from "@modules/customCommands/interfaces/ICustomCommand";
import "@common/types/discord.js/index.d.ts";
import CustomCommandsModule from "@modules/customCommands/CustomCommandsModule";
import CustomCommandsDB from "@modules/customCommands/db/CustomCommandsDB";

describe("createCommandListMessages", () => {
  beforeEach(() => {
    // Initialize the module
    CustomCommandsModule.getInstance();
  });

  it("should return a single message if commands fit within 2000 characters", () => {
    const commands = Array.from({ length: 5 }, (_, i) => ({ name: `cmd${i + 1}` })) as ICustomCommand[];

    const db = new CustomCommandsDB();

    const result = db.createCommandListMessages(commands);

    expect(result.length).toBe(1);
    expect(result[0]).toContain("**Custom Commands (5 commands)**");
    commands.forEach((cmd) => {
      expect(result[0]).toContain(`!${cmd.name}`);
    });
  });

  it("should split messages when exceeding 2000 characters", () => {
    const longCommand = "x".repeat(500); // Each command takes 502 characters (prefix + newline)
    const commands = Array.from({ length: 5 }, (_, i) => ({ name: longCommand + i })) as ICustomCommand[];

    const db = new CustomCommandsDB();

    const result = db.createCommandListMessages(commands);

    expect(result.length).toBeGreaterThan(1);
    expect(result[0].length).toBeLessThanOrEqual(2000);
    expect(result[result.length - 1].length).toBeLessThanOrEqual(2000);
  });

  it("should handle an empty command list", () => {
    const db = new CustomCommandsDB();
    const result = db.createCommandListMessages([]);

    expect(result.length).toBe(1);
    expect(result[0]).toBe("**Custom Commands (0 commands)**\n");
  });
});
