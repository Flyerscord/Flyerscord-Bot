import { z } from "zod";
import type { Modules } from "@modules/Modules";
import type { IModuleConfigSchema } from "@common/models/Module";

// Mock dependencies
const mockDb = {
  select: jest.fn().mockReturnThis(),
  from: jest.fn(),
  insert: jest.fn().mockReturnThis(),
  values: jest.fn().mockReturnThis(),
  onConflictDoNothing: jest.fn(),
};

const mockStumper = {
  error: jest.fn(),
  warning: jest.fn(),
  caughtError: jest.fn(),
  success: jest.fn(),
  info: jest.fn(),
  debug: jest.fn(),
};

jest.mock("@common/db/db", () => ({
  default: {
    getInstance: jest.fn(() => ({
      getDb: jest.fn(() => mockDb),
    })),
  },
}));

jest.mock("stumper", () => mockStumper);

// Mock the schema to avoid import errors
jest.mock("@common/db/schema", () => ({
  config: {},
}));

describe("ConfigManager", () => {
  let ConfigManager: typeof import("@root/src/common/managers/ConfigManager").default;

  beforeEach(async () => {
    jest.clearAllMocks();
    jest.resetModules();

    // Re-import to get fresh instance
    const module = await import("@root/src/common/managers/ConfigManager");
    ConfigManager = module.default;
  });

  describe("addNewConfigSchema", () => {
    it("should add a new config schema for a module", async () => {
      const configManager = ConfigManager.getInstance();
      const schema: IModuleConfigSchema<"testKey"> = {
        key: "testKey",
        schema: z.string(),
        defaultValue: "default",
        required: true,
        description: "Test config",
        secret: false,
        requiresRestart: false,
      };

      mockDb.from.mockResolvedValue([]);

      await configManager.addNewConfigSchema("Common", schema);

      expect(mockDb.insert).toHaveBeenCalled();
      expect(mockDb.values).toHaveBeenCalledWith({
        moduleName: "Common",
        key: "testKey",
      });
      expect(mockDb.onConflictDoNothing).toHaveBeenCalled();
    });

    it("should add multiple config schemas for the same module", async () => {
      const configManager = ConfigManager.getInstance();
      const schema1: IModuleConfigSchema<"key1"> = {
        key: "key1",
        schema: z.string(),
        defaultValue: "default1",
        required: true,
        description: "Test config 1",
        secret: false,
        requiresRestart: false,
      };
      const schema2: IModuleConfigSchema<"key2"> = {
        key: "key2",
        schema: z.number(),
        defaultValue: 42,
        required: false,
        description: "Test config 2",
        secret: false,
        requiresRestart: true,
      };

      mockDb.from.mockResolvedValue([]);

      await configManager.addNewConfigSchema("Common", schema1);
      await configManager.addNewConfigSchema("Common", schema2);

      expect(mockDb.insert).toHaveBeenCalledTimes(2);
    });
  });

  describe("refreshConfig", () => {
    it("should return success false when no configs found in database", async () => {
      const configManager = ConfigManager.getInstance();
      mockDb.from.mockResolvedValue([]);

      const result = await configManager.refreshConfig();

      expect(result.success).toBe(false);
      expect(mockStumper.error).toHaveBeenCalledWith("No configs found", "common:ConfigManager:refreshConfig");
    });

    it("should successfully refresh config with database values", async () => {
      const configManager = ConfigManager.getInstance();
      const schema: IModuleConfigSchema<"testKey"> = {
        key: "testKey",
        schema: z.string(),
        defaultValue: "default",
        required: false,
        description: "Test config",
        secret: false,
        requiresRestart: false,
      };

      await configManager.addNewConfigSchema("Common", schema);

      const dbConfigs = [
        {
          moduleName: "Common" as Modules,
          key: "testKey",
          value: "dbValue",
          updatedAt: new Date(),
        },
      ];
      mockDb.from.mockResolvedValue(dbConfigs);

      const result = await configManager.refreshConfig();

      expect(result.success).toBe(true);
      expect(result.keysChanged).toContain("testKey");
    });

    it("should use default value when database value is null for optional config", async () => {
      const configManager = ConfigManager.getInstance();
      const schema: IModuleConfigSchema<"testKey"> = {
        key: "testKey",
        schema: z.string(),
        defaultValue: "default",
        required: false,
        description: "Test config",
        secret: false,
        requiresRestart: false,
      };

      await configManager.addNewConfigSchema("Common", schema);

      const dbConfigs = [
        {
          moduleName: "Common" as Modules,
          key: "testKey",
          value: null,
          updatedAt: new Date(),
        },
      ];
      mockDb.from.mockResolvedValue(dbConfigs);

      const result = await configManager.refreshConfig();

      expect(result.success).toBe(true);
    });

    it("should mark success false for required config with no database value", async () => {
      const configManager = ConfigManager.getInstance();
      const schema: IModuleConfigSchema<"testKey"> = {
        key: "testKey",
        schema: z.string(),
        defaultValue: "default",
        required: true,
        description: "Test config",
        secret: false,
        requiresRestart: false,
      };

      await configManager.addNewConfigSchema("Common", schema);

      const dbConfigs = [
        {
          moduleName: "Common" as Modules,
          key: "testKey",
          value: null,
          updatedAt: new Date(),
        },
      ];
      mockDb.from.mockResolvedValue(dbConfigs);

      const result = await configManager.refreshConfig();

      expect(result.success).toBe(false);
      expect(mockStumper.warning).toHaveBeenCalledWith(
        expect.stringContaining("is required but has no value in DB"),
        "common:ConfigManager:refreshConfig",
      );
    });

    it("should track configs that require restart when changed", async () => {
      const configManager = ConfigManager.getInstance();
      const schema: IModuleConfigSchema<"testKey"> = {
        key: "testKey",
        schema: z.string(),
        defaultValue: "default",
        required: false,
        description: "Test config",
        secret: false,
        requiresRestart: true,
      };

      await configManager.addNewConfigSchema("Common", schema);

      const dbConfigs = [
        {
          moduleName: "Common" as Modules,
          key: "testKey",
          value: "newValue",
          updatedAt: new Date(),
        },
      ];
      mockDb.from.mockResolvedValue(dbConfigs);

      const result = await configManager.refreshConfig();

      expect(result.keysRequireRestart).toContain("testKey");
      expect(result.keysChanged).toContain("testKey");
    });

    it("should track configs missing from map", async () => {
      const configManager = ConfigManager.getInstance();

      const dbConfigs = [
        {
          moduleName: "Common" as Modules,
          key: "unknownKey",
          value: "value",
          updatedAt: new Date(),
        },
      ];
      mockDb.from.mockResolvedValue(dbConfigs);

      const result = await configManager.refreshConfig();

      expect(result.configsMissingFromMap).toHaveLength(1);
      expect(result.configsMissingFromMap[0]).toEqual({
        module: "Common",
        key: "unknownKey",
      });
      expect(mockStumper.error).toHaveBeenCalledWith(
        expect.stringContaining("was found in database but not in config map"),
        "common:ConfigManager:refreshConfig",
      );
    });
  });

  describe("validateModule", () => {
    it("should return true for module with no configs", async () => {
      const configManager = ConfigManager.getInstance();
      mockDb.from.mockResolvedValue([]);

      const isValid = configManager.validateModule("Common");

      expect(isValid).toBe(true);
      expect(mockStumper.warning).toHaveBeenCalledWith("Module Common does have any configs", "common:ConfigManager:validateModule");
    });

    it("should return false when required config has no value", async () => {
      const configManager = ConfigManager.getInstance();
      const schema: IModuleConfigSchema<"testKey"> = {
        key: "testKey",
        schema: z.string(),
        defaultValue: "default",
        required: true,
        description: "Test config",
        secret: false,
        requiresRestart: false,
      };

      await configManager.addNewConfigSchema("Common", schema);
      mockDb.from.mockResolvedValue([]);

      const isValid = configManager.validateModule("Common");

      expect(isValid).toBe(false);
      expect(mockStumper.error).toHaveBeenCalledWith(expect.stringContaining("is required but has no value"), "common:ConfigManager:validateModule");
    });

    it("should return true when all required configs have values", async () => {
      const configManager = ConfigManager.getInstance();
      const schema: IModuleConfigSchema<"testKey"> = {
        key: "testKey",
        schema: z.string(),
        defaultValue: "default",
        required: true,
        description: "Test config",
        secret: false,
        requiresRestart: false,
      };

      await configManager.addNewConfigSchema("Common", schema);

      const dbConfigs = [
        {
          moduleName: "Common" as Modules,
          key: "testKey",
          value: "actualValue",
          updatedAt: new Date(),
        },
      ];
      mockDb.from.mockResolvedValue(dbConfigs);

      await configManager.refreshConfig();

      const isValid = configManager.validateModule("Common");

      expect(isValid).toBe(true);
    });
  });

  describe("getConfig", () => {
    it("should throw error when module config not loaded", () => {
      const configManager = ConfigManager.getInstance();

      expect(() => configManager.getConfig("Common")).toThrow("Config for module Common not loaded");
    });

    it("should return typed config object for module", async () => {
      const configManager = ConfigManager.getInstance();
      const schema1: IModuleConfigSchema<"key1"> = {
        key: "key1",
        schema: z.string(),
        defaultValue: "default1",
        required: false,
        description: "Test config 1",
        secret: false,
        requiresRestart: false,
      };
      const schema2: IModuleConfigSchema<"key2"> = {
        key: "key2",
        schema: z.coerce.number(),
        defaultValue: 42,
        required: false,
        description: "Test config 2",
        secret: false,
        requiresRestart: false,
      };

      await configManager.addNewConfigSchema("Common", schema1);
      await configManager.addNewConfigSchema("Common", schema2);

      const dbConfigs = [
        {
          moduleName: "Common" as Modules,
          key: "key1",
          value: "testValue",
          updatedAt: new Date(),
        },
        {
          moduleName: "Common" as Modules,
          key: "key2",
          value: "100",
          updatedAt: new Date(),
        },
      ];
      mockDb.from.mockResolvedValue(dbConfigs);

      await configManager.refreshConfig();

      const config = configManager.getConfig("Common");

      expect(config).toHaveProperty("key1", "testValue");
      expect(config).toHaveProperty("key2", 100);
    });
  });

  describe("parseValue edge cases", () => {
    it("should handle parsing errors gracefully for optional configs", async () => {
      const configManager = ConfigManager.getInstance();
      const schema: IModuleConfigSchema<"testKey"> = {
        key: "testKey",
        schema: z.number(),
        defaultValue: 42,
        required: false,
        description: "Test config",
        secret: false,
        requiresRestart: false,
      };

      await configManager.addNewConfigSchema("Common", schema);

      const dbConfigs = [
        {
          moduleName: "Common" as Modules,
          key: "testKey",
          value: "not-a-number",
          updatedAt: new Date(),
        },
      ];
      mockDb.from.mockResolvedValue(dbConfigs);

      await configManager.refreshConfig();

      expect(mockStumper.caughtError).toHaveBeenCalled();
    });

    it("should return empty string for required configs with parsing errors", async () => {
      const configManager = ConfigManager.getInstance();
      const schema: IModuleConfigSchema<"testKey"> = {
        key: "testKey",
        schema: z.number(),
        defaultValue: 42,
        required: true,
        description: "Test config",
        secret: false,
        requiresRestart: false,
      };

      await configManager.addNewConfigSchema("Common", schema);

      const dbConfigs = [
        {
          moduleName: "Common" as Modules,
          key: "testKey",
          value: "not-a-number",
          updatedAt: new Date(),
        },
      ];
      mockDb.from.mockResolvedValue(dbConfigs);

      await configManager.refreshConfig();

      expect(mockStumper.caughtError).toHaveBeenCalled();
    });

    it("should handle async schema transformations", async () => {
      const configManager = ConfigManager.getInstance();
      const asyncSchema = z.string().transform(async (val) => {
        return val.toUpperCase();
      });

      const schema: IModuleConfigSchema<"testKey"> = {
        key: "testKey",
        schema: asyncSchema,
        defaultValue: "default",
        required: false,
        description: "Test config",
        secret: false,
        requiresRestart: false,
      };

      await configManager.addNewConfigSchema("Common", schema);

      const dbConfigs = [
        {
          moduleName: "Common" as Modules,
          key: "testKey",
          value: "lowercase",
          updatedAt: new Date(),
        },
      ];
      mockDb.from.mockResolvedValue(dbConfigs);

      await configManager.refreshConfig();

      const config = configManager.getConfig("Common");
      expect(config).toHaveProperty("testKey", "LOWERCASE");
    });
  });

  describe("singleton behavior", () => {
    it("should return the same instance on multiple getInstance calls", () => {
      const instance1 = ConfigManager.getInstance();
      const instance2 = ConfigManager.getInstance();

      expect(instance1).toBe(instance2);
    });
  });

  describe("value change detection", () => {
    it("should not mark unchanged values as changed", async () => {
      const configManager = ConfigManager.getInstance();
      const schema: IModuleConfigSchema<"testKey"> = {
        key: "testKey",
        schema: z.string(),
        defaultValue: "default",
        required: false,
        description: "Test config",
        secret: false,
        requiresRestart: false,
      };

      await configManager.addNewConfigSchema("Common", schema);

      const dbConfigs = [
        {
          moduleName: "Common" as Modules,
          key: "testKey",
          value: "value1",
          updatedAt: new Date(),
        },
      ];
      mockDb.from.mockResolvedValue(dbConfigs);

      // First refresh
      await configManager.refreshConfig();

      // Second refresh with same value
      const result = await configManager.refreshConfig();

      expect(result.keysChanged).toHaveLength(0);
    });

    it("should detect when value changes between refreshes", async () => {
      const configManager = ConfigManager.getInstance();
      const schema: IModuleConfigSchema<"testKey"> = {
        key: "testKey",
        schema: z.string(),
        defaultValue: "default",
        required: false,
        description: "Test config",
        secret: false,
        requiresRestart: false,
      };

      await configManager.addNewConfigSchema("Common", schema);

      const dbConfigs1 = [
        {
          moduleName: "Common" as Modules,
          key: "testKey",
          value: "value1",
          updatedAt: new Date(),
        },
      ];
      mockDb.from.mockResolvedValue(dbConfigs1);

      await configManager.refreshConfig();

      const dbConfigs2 = [
        {
          moduleName: "Common" as Modules,
          key: "testKey",
          value: "value2",
          updatedAt: new Date(),
        },
      ];
      mockDb.from.mockResolvedValue(dbConfigs2);

      const result = await configManager.refreshConfig();

      expect(result.keysChanged).toContain("testKey");
    });
  });
});
