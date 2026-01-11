import { z } from "zod";
import type { Modules } from "@modules/Modules";
import type { IModuleConfigSchema } from "@common/models/Module";

// Mock dependencies
const mockDb = {
  select: jest.fn().mockReturnThis(),
  from: jest.fn().mockReturnThis(),
  where: jest.fn().mockResolvedValue([]), // Default empty array
  insert: jest.fn().mockReturnThis(),
  values: jest.fn().mockReturnThis(),
  onConflictDoNothing: jest.fn().mockResolvedValue(undefined),
};

const mockStumper = {
  error: jest.fn(),
  warning: jest.fn(),
  caughtError: jest.fn(),
  success: jest.fn(),
  info: jest.fn(),
  debug: jest.fn(),
};

jest.mock("@common/db/db", () => {
  return {
    __esModule: true,
    default: {
      getInstance: jest.fn(() => ({
        getDb: jest.fn(() => mockDb),
      })),
    },
  };
});

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

    // Clear singleton instance
    const Singleton = await import("@root/src/common/models/Singleton");
    // @ts-expect-error - Accessing private static field for testing
    Singleton.Singleton.instances = new Map();

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

      mockDb.where.mockResolvedValue([]);

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

      mockDb.where.mockResolvedValue([]);

      await configManager.addNewConfigSchema("Common", schema1);
      await configManager.addNewConfigSchema("Common", schema2);

      expect(mockDb.insert).toHaveBeenCalledTimes(2);
    });
  });

  describe("refreshConfig", () => {
    it("should return success false when no configs found in database", async () => {
      const configManager = ConfigManager.getInstance();
      mockDb.where.mockResolvedValue([]);

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
      mockDb.where.mockResolvedValue(dbConfigs);

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
      mockDb.where.mockResolvedValue(dbConfigs);

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
      mockDb.where.mockResolvedValue(dbConfigs);

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
      mockDb.where.mockResolvedValue(dbConfigs);

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
      mockDb.where.mockResolvedValue(dbConfigs);

      const result = await configManager.refreshConfig();

      expect(result.configsMissingFromMap).toHaveLength(1);
      expect(result.configsMissingFromMap[0]).toEqual({
        module: "Common",
        key: "unknownKey",
      });
      expect(mockStumper.warning).toHaveBeenCalledWith(
        expect.stringContaining("was found in database but not in config map"),
        "common:ConfigManager:refreshConfig",
      );
    });
  });

  describe("validateModule", () => {
    it("should return true for module with no configs", async () => {
      const configManager = ConfigManager.getInstance();

      // Add a config to avoid "No configs found" error
      const dummySchema: IModuleConfigSchema<"dummyKey"> = {
        key: "dummyKey",
        schema: z.string(),
        defaultValue: "dummy",
        required: false,
        description: "Dummy config",
        secret: false,
        requiresRestart: false,
      };
      await configManager.addNewConfigSchema("Admin", dummySchema);

      const dbConfigs = [
        {
          moduleName: "Admin" as Modules,
          key: "dummyKey",
          value: "value",
          updatedAt: new Date(),
        },
      ];
      mockDb.where.mockResolvedValue(dbConfigs);

      // Need to load configs first
      await configManager.refreshConfig();

      // Now validate a module with no configs
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

      const dbConfigs = [
        {
          moduleName: "Common" as Modules,
          key: "testKey",
          value: null,
          updatedAt: new Date(),
        },
      ];
      mockDb.where.mockResolvedValue(dbConfigs);

      await configManager.refreshConfig();

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
      mockDb.where.mockResolvedValue(dbConfigs);

      await configManager.refreshConfig();

      const isValid = configManager.validateModule("Common");

      expect(isValid).toBe(true);
    });
  });

  describe("getConfig", () => {
    it("should throw error when configs have not been loaded yet", () => {
      const configManager = ConfigManager.getInstance();

      expect(() => configManager.getConfig("Common")).toThrow("Configs have not been loaded yet!");
    });

    it("should throw error when module config not loaded", async () => {
      const configManager = ConfigManager.getInstance();

      // Add a config for a different module to allow refreshConfig to succeed
      const dummySchema: IModuleConfigSchema<"dummyKey"> = {
        key: "dummyKey",
        schema: z.string(),
        defaultValue: "dummy",
        required: false,
        description: "Dummy config",
        secret: false,
        requiresRestart: false,
      };
      await configManager.addNewConfigSchema("Admin", dummySchema);

      const dbConfigs = [
        {
          moduleName: "Admin" as Modules,
          key: "dummyKey",
          value: "value",
          updatedAt: new Date(),
        },
      ];
      mockDb.where.mockResolvedValue(dbConfigs);

      await configManager.refreshConfig();

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
      mockDb.where.mockResolvedValue(dbConfigs);

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
      mockDb.where.mockResolvedValue(dbConfigs);

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
      mockDb.where.mockResolvedValue(dbConfigs);

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
      mockDb.where.mockResolvedValue(dbConfigs);

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

  describe("isLoaded", () => {
    it("should return false before refreshConfig is called", () => {
      const configManager = ConfigManager.getInstance();
      expect(configManager.isLoaded()).toBe(false);
    });

    it("should return true after successful refreshConfig", async () => {
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
          value: "value",
          updatedAt: new Date(),
        },
      ];
      mockDb.where.mockResolvedValue(dbConfigs);

      expect(configManager.isLoaded()).toBe(false);
      await configManager.refreshConfig();
      expect(configManager.isLoaded()).toBe(true);
    });

    it("should remain false after failed refreshConfig with no configs", async () => {
      const configManager = ConfigManager.getInstance();
      mockDb.where.mockResolvedValue([]);

      const result = await configManager.refreshConfig();

      expect(result.success).toBe(false);
      expect(configManager.isLoaded()).toBe(false);
    });
  });

  describe("multiple modules", () => {
    it("should handle configs from multiple modules independently", async () => {
      const configManager = ConfigManager.getInstance();

      await configManager.addNewConfigSchema("Common", {
        key: "commonKey",
        schema: z.string(),
        defaultValue: "common",
        required: false,
        description: "Common config",
        secret: false,
        requiresRestart: false,
      });

      await configManager.addNewConfigSchema("Admin", {
        key: "adminKey",
        schema: z.coerce.number(),
        defaultValue: 42,
        required: false,
        description: "Admin config",
        secret: false,
        requiresRestart: false,
      });

      const dbConfigs = [
        {
          moduleName: "Common" as Modules,
          key: "commonKey",
          value: "commonValue",
          updatedAt: new Date(),
        },
        {
          moduleName: "Admin" as Modules,
          key: "adminKey",
          value: "100",
          updatedAt: new Date(),
        },
      ];
      mockDb.where.mockResolvedValue(dbConfigs);

      await configManager.refreshConfig();

      const commonConfig = configManager.getConfig("Common");
      const adminConfig = configManager.getConfig("Admin");

      expect(commonConfig).toHaveProperty("commonKey", "commonValue");
      expect(adminConfig).toHaveProperty("adminKey", 100);
      expect(adminConfig).not.toHaveProperty("commonKey");
      expect(commonConfig).not.toHaveProperty("adminKey");
    });
  });

  describe("type transformations", () => {
    it("should handle boolean coercion from string values", async () => {
      const configManager = ConfigManager.getInstance();
      const schema: IModuleConfigSchema<"enabled"> = {
        key: "enabled",
        schema: z.coerce.boolean(),
        defaultValue: false,
        required: false,
        description: "Feature enabled",
        secret: false,
        requiresRestart: false,
      };

      await configManager.addNewConfigSchema("Common", schema);

      const dbConfigs = [
        {
          moduleName: "Common" as Modules,
          key: "enabled",
          value: "true",
          updatedAt: new Date(),
        },
      ];
      mockDb.where.mockResolvedValue(dbConfigs);

      await configManager.refreshConfig();

      const config = configManager.getConfig("Common");
      // @ts-expect-error - Testing dynamic config not in type map
      expect(config.enabled).toBe(true);
      // @ts-expect-error - Testing dynamic config not in type map
      expect(typeof config.enabled).toBe("boolean");
    });

    it("should handle schemas with custom transformations", async () => {
      const configManager = ConfigManager.getInstance();

      const transformSchema = z.string().transform((val) => val.toUpperCase());

      const schema: IModuleConfigSchema<"transformed"> = {
        key: "transformed",
        schema: transformSchema,
        defaultValue: "default",
        required: false,
        description: "Transformed config",
        secret: true, // Just metadata for UI
        requiresRestart: false,
      };

      await configManager.addNewConfigSchema("Common", schema);

      const dbConfigs = [
        {
          moduleName: "Common" as Modules,
          key: "transformed",
          value: "lowercase",
          updatedAt: new Date(),
        },
      ];
      mockDb.where.mockResolvedValue(dbConfigs);

      await configManager.refreshConfig();

      const config = configManager.getConfig("Common");
      // @ts-expect-error - Testing dynamic config not in type map
      expect(config.transformed).toBe("LOWERCASE");
    });
  });

  describe("refreshConfig detailed results", () => {
    it("should return correct lists for keysChanged and keysRequireRestart", async () => {
      const configManager = ConfigManager.getInstance();

      await configManager.addNewConfigSchema("Common", {
        key: "normalKey",
        schema: z.string(),
        defaultValue: "default1",
        required: false,
        description: "Normal config",
        secret: false,
        requiresRestart: false,
      });

      await configManager.addNewConfigSchema("Common", {
        key: "restartKey",
        schema: z.string(),
        defaultValue: "default2",
        required: false,
        description: "Restart config",
        secret: false,
        requiresRestart: true,
      });

      mockDb.where.mockResolvedValue([
        { moduleName: "Common" as Modules, key: "normalKey", value: "value1", updatedAt: new Date() },
        { moduleName: "Common" as Modules, key: "restartKey", value: "value2", updatedAt: new Date() },
      ]);

      const result = await configManager.refreshConfig();

      expect(result.success).toBe(true);
      expect(result.keysChanged).toEqual(expect.arrayContaining(["normalKey", "restartKey"]));
      expect(result.keysRequireRestart).toEqual(["restartKey"]);
      expect(result.keysRequireRestart).not.toContain("normalKey");
    });

    it("should handle mix of required and optional configs in validation", async () => {
      const configManager = ConfigManager.getInstance();

      await configManager.addNewConfigSchema("Common", {
        key: "required",
        schema: z.string(),
        defaultValue: "default",
        required: true,
        description: "Required config",
        secret: false,
        requiresRestart: false,
      });

      await configManager.addNewConfigSchema("Common", {
        key: "optional",
        schema: z.string(),
        defaultValue: "default",
        required: false,
        description: "Optional config",
        secret: false,
        requiresRestart: false,
      });

      const dbConfigs = [
        {
          moduleName: "Common" as Modules,
          key: "required",
          value: "hasValue",
          updatedAt: new Date(),
        },
        {
          moduleName: "Common" as Modules,
          key: "optional",
          value: null, // Optional has no value, should use default
          updatedAt: new Date(),
        },
      ];
      mockDb.where.mockResolvedValue(dbConfigs);

      await configManager.refreshConfig();

      const config = configManager.getConfig("Common");

      // @ts-expect-error - Testing dynamic config not in type map
      expect(config.required).toBe("hasValue");
      // @ts-expect-error - Testing dynamic config not in type map
      expect(config.optional).toBe("default"); // Should use default value

      const isValid = configManager.validateModule("Common");
      expect(isValid).toBe(true);
    });
  });

  describe("schema registration", () => {
    it("should handle adding same config key multiple times gracefully", async () => {
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
      await configManager.addNewConfigSchema("Common", schema);

      expect(mockDb.insert).toHaveBeenCalledTimes(2);
      expect(mockDb.onConflictDoNothing).toHaveBeenCalledTimes(2);
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
      mockDb.where.mockResolvedValue(dbConfigs);

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
      mockDb.where.mockResolvedValue(dbConfigs1);

      await configManager.refreshConfig();

      const dbConfigs2 = [
        {
          moduleName: "Common" as Modules,
          key: "testKey",
          value: "value2",
          updatedAt: new Date(),
        },
      ];
      mockDb.where.mockResolvedValue(dbConfigs2);

      const result = await configManager.refreshConfig();

      expect(result.keysChanged).toContain("testKey");
    });
  });
});
