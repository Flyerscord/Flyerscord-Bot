// Mock the database BEFORE any imports
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

// Mock ConfigManager with a stable mock instance
const mockAddNewConfigSchema = jest.fn().mockResolvedValue(undefined);
const mockValidateModule = jest.fn().mockReturnValue(true);
const mockGetConfig = jest.fn(() => ({
  "ub3rBot.userId": "ub3r-bot-123",
  "ub3rBot.alertChannelId": "alert-channel-456",
}));

jest.mock("@common/managers/ConfigManager", () => {
  return {
    __esModule: true,
    default: {
      getInstance: jest.fn(() => ({
        getConfig: mockGetConfig,
        addNewConfigSchema: mockAddNewConfigSchema,
        validateModule: mockValidateModule,
      })),
    },
  };
});

// Mock SchemaManager
jest.mock("@common/managers/SchemaManager", () => {
  return {
    __esModule: true,
    default: {
      getInstance: jest.fn(() => ({
        register: jest.fn(),
      })),
    },
  };
});

// Mock SlashCommandManager
jest.mock("@common/managers/SlashCommandManager", () => {
  return {
    __esModule: true,
    default: {
      getInstance: jest.fn(() => ({
        addCommands: jest.fn(),
      })),
    },
  };
});

// Mock ClientManager
jest.mock("@common/managers/ClientManager", () => {
  const mockClient = {
    on: jest.fn(),
    once: jest.fn(),
    emit: jest.fn(),
  };

  return {
    __esModule: true,
    default: {
      getInstance: jest.fn(() => ({
        client: mockClient,
      })),
    },
  };
});

// Mock discord utilities
jest.mock("@common/utils/discord/discord", () => ({
  messages: {
    sendMessageToChannel: jest.fn().mockResolvedValue(undefined),
  },
  members: {
    getMember: jest.fn(),
    getMembers: jest.fn(),
  },
  roles: {
    addRoleToUser: jest.fn().mockResolvedValue(undefined),
    userHasAnyRole: jest.fn(),
  },
}));

// Mock Stumper logger
jest.mock("stumper", () => ({
  __esModule: true,
  default: {
    error: jest.fn(),
    info: jest.fn(),
    warning: jest.fn(),
    debug: jest.fn(),
    success: jest.fn(),
    caughtError: jest.fn(),
  },
}));

import AdminModule, { adminConfigSchema, AdminConfigKeys } from "@modules/admin/AdminModule";

describe("AdminModule", () => {
  beforeEach(() => {
    jest.clearAllMocks();

    // Reset singleton instance before each test
    // @ts-expect-error - accessing private static property for testing
    AdminModule.instances = new Map();
  });

  describe("config schema", () => {
    it("should define ub3rBot.userId config", () => {
      const userIdConfig = adminConfigSchema.find((c) => c.key === "ub3rBot.userId");

      expect(userIdConfig).toBeDefined();
      expect(userIdConfig!.description).toBe("The user ID of the ub3rBot");
      expect(userIdConfig!.required).toBe(true);
      expect(userIdConfig!.secret).toBe(false);
      expect(userIdConfig!.requiresRestart).toBe(false);
      expect(userIdConfig!.defaultValue).toBe("");
    });

    it("should define ub3rBot.alertChannelId config", () => {
      const alertChannelConfig = adminConfigSchema.find((c) => c.key === "ub3rBot.alertChannelId");

      expect(alertChannelConfig).toBeDefined();
      expect(alertChannelConfig!.description).toBe("The channel ID of the ub3rBot alert channel");
      expect(alertChannelConfig!.required).toBe(true);
      expect(alertChannelConfig!.secret).toBe(false);
      expect(alertChannelConfig!.requiresRestart).toBe(false);
      expect(alertChannelConfig!.defaultValue).toBe("");
    });

    it("should have exactly 2 config entries", () => {
      expect(adminConfigSchema).toHaveLength(2);
    });

    it("should have valid Zod schemas for each config", () => {
      for (const config of adminConfigSchema) {
        expect(config.schema).toBeDefined();
        // Verify the schema can parse valid strings
        expect(config.schema.safeParse("test-value").success).toBe(true);
      }
    });
  });

  describe("AdminConfigKeys type", () => {
    it("should include expected keys", () => {
      const keys: AdminConfigKeys[] = ["ub3rBot.userId", "ub3rBot.alertChannelId"];
      expect(keys).toHaveLength(2);
    });
  });

  describe("module instantiation", () => {
    it("should create module with correct name", () => {
      const module = AdminModule.getInstance();
      expect(module.name).toBe("Admin");
    });

    it("should be a singleton", () => {
      const module1 = AdminModule.getInstance();
      const module2 = AdminModule.getInstance();
      expect(module1).toBe(module2);
    });

    it("should have Common as a dependency", () => {
      const module = AdminModule.getInstance();
      expect(module.getDependencies()).toContain("Common");
    });

    it("should not be prod only", () => {
      const module = AdminModule.getInstance();
      expect(module.isProdOnly()).toBe(false);
    });

    it("should have default load priority of 50", () => {
      const module = AdminModule.getInstance();
      expect(module.getLoadPriority()).toBe(50);
    });
  });

  describe("registration", () => {
    it("should register config schemas when registered", async () => {
      const module = AdminModule.getInstance();

      await module.register();

      expect(module.isRegistered()).toBe(true);
      expect(mockAddNewConfigSchema).toHaveBeenCalledTimes(2);
      expect(mockAddNewConfigSchema).toHaveBeenCalledWith("Admin", expect.objectContaining({ key: "ub3rBot.userId" }));
      expect(mockAddNewConfigSchema).toHaveBeenCalledWith("Admin", expect.objectContaining({ key: "ub3rBot.alertChannelId" }));
    });

    it("should not register twice when called multiple times", async () => {
      const module = AdminModule.getInstance();

      await module.register();
      const callCountAfterFirst = mockAddNewConfigSchema.mock.calls.length;

      await module.register();

      // Should not add more calls after first registration
      expect(mockAddNewConfigSchema).toHaveBeenCalledTimes(callCountAfterFirst);
    });
  });

  describe("getConfigSchema", () => {
    it("should return a copy of the config schema", () => {
      const module = AdminModule.getInstance();
      const schema = module.getConfigSchema();

      expect(schema).toHaveLength(adminConfigSchema.length);
      expect(schema).not.toBe(adminConfigSchema); // Should be a copy, not the same reference
    });

    it("should contain all config entries", () => {
      const module = AdminModule.getInstance();
      const schema = module.getConfigSchema();

      const keys = schema.map((s) => s.key);
      expect(keys).toContain("ub3rBot.userId");
      expect(keys).toContain("ub3rBot.alertChannelId");
    });
  });

  describe("lifecycle state", () => {
    it("should not be started before enable is called", () => {
      const module = AdminModule.getInstance();
      expect(module.isStarted()).toBe(false);
    });

    it("should not have valid config before enable is called", () => {
      const module = AdminModule.getInstance();
      expect(module.isConfigValid()).toBe(false);
    });
  });
});
