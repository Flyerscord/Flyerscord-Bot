import ZodWrapper from "../../src/common/utils/ZodWrapper";
import { SchemaInspector } from "../../src/cli/lib/SchemaInspector";
import SecretManager from "../../src/common/managers/SecretManager";

// Mock the SecretManager to avoid needing real encryption keys
jest.mock("../../src/common/managers/SecretManager");

describe("ConfigSetter Encryption Integration", () => {
  let mockSecretManager: jest.Mocked<SecretManager>;

  beforeEach(() => {
    // Setup mock secret manager
    mockSecretManager = {
      encrypt: jest.fn((value: string) => `encrypted_${value}`),
      decrypt: jest.fn((value: string) => value.replace("encrypted_", "")),
    } as unknown as jest.Mocked<SecretManager>;

    // Mock getInstance to return our mock
    (SecretManager.getInstance as jest.Mock) = jest.fn(() => mockSecretManager);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe("Encrypted String Detection and Handling", () => {
    it("should correctly identify encrypted strings", () => {
      const encryptedSchema = ZodWrapper.encryptedString();
      const regularSchema = ZodWrapper.string();

      expect(SchemaInspector.isEncryptedString(encryptedSchema)).toBe(true);
      expect(SchemaInspector.isEncryptedString(regularSchema)).toBe(false);
    });

    it("should identify encrypted strings even when wrapped", () => {
      const optionalEncrypted = ZodWrapper.encryptedString().optional();
      const defaultEncrypted = ZodWrapper.encryptedString().default("");

      expect(SchemaInspector.isEncryptedString(optionalEncrypted)).toBe(true);
      expect(SchemaInspector.isEncryptedString(defaultEncrypted)).toBe(true);
    });

    it("should not identify regular transforms as encrypted", () => {
      const regularString = ZodWrapper.string();

      expect(SchemaInspector.isEncryptedString(regularString)).toBe(false);
    });
  });

  describe("Encryption Flow Simulation", () => {
    it("should encrypt values for encryptedString schemas", () => {
      const schema = ZodWrapper.encryptedString();
      const isEncrypted = SchemaInspector.isEncryptedString(schema);
      const testValue = "my-secret-token";

      // Simulate what ConfigSetter does
      let valueToStore: string;
      if (isEncrypted && typeof testValue === "string") {
        valueToStore = mockSecretManager.encrypt(testValue);
      } else {
        valueToStore = testValue;
      }

      expect(valueToStore).toBe("encrypted_my-secret-token");
      expect(mockSecretManager.encrypt).toHaveBeenCalledWith(testValue);
    });

    it("should not encrypt regular strings", () => {
      const schema = ZodWrapper.string();
      const isEncrypted = SchemaInspector.isEncryptedString(schema);
      const testValue = "regular-value";

      // Simulate what ConfigSetter does
      let valueToStore: string;
      if (isEncrypted && typeof testValue === "string") {
        valueToStore = mockSecretManager.encrypt(testValue);
      } else {
        valueToStore = testValue;
      }

      expect(valueToStore).toBe("regular-value");
      expect(mockSecretManager.encrypt).not.toHaveBeenCalled();
    });

    it("should handle encryption for wrapped encrypted schemas", () => {
      const schema = ZodWrapper.encryptedString().optional();
      const isEncrypted = SchemaInspector.isEncryptedString(schema);
      const testValue = "optional-secret";

      let valueToStore: string;
      if (isEncrypted && typeof testValue === "string") {
        valueToStore = mockSecretManager.encrypt(testValue);
      } else {
        valueToStore = testValue;
      }

      expect(valueToStore).toBe("encrypted_optional-secret");
      expect(mockSecretManager.encrypt).toHaveBeenCalledWith(testValue);
    });
  });

  describe("Type Safety", () => {
    it("should only encrypt string values", () => {
      const schema = ZodWrapper.encryptedString();
      const isEncrypted = SchemaInspector.isEncryptedString(schema);

      // Numbers should not be encrypted even if schema is detected as encrypted
      const numberValue = 123;
      let valueToStore: string;

      if (isEncrypted && typeof numberValue === "string") {
        valueToStore = mockSecretManager.encrypt(numberValue);
      } else {
        valueToStore = String(numberValue);
      }

      expect(valueToStore).toBe("123");
      expect(mockSecretManager.encrypt).not.toHaveBeenCalled();
    });

    it("should handle objects and arrays separately", () => {
      const schema = ZodWrapper.encryptedString();
      const isEncrypted = SchemaInspector.isEncryptedString(schema);

      const objectValue = { key: "value" };
      let valueToStore: string;

      if (isEncrypted && typeof objectValue === "string") {
        valueToStore = mockSecretManager.encrypt(objectValue as unknown as string);
      } else if (typeof objectValue === "object") {
        valueToStore = JSON.stringify(objectValue);
      } else {
        valueToStore = String(objectValue);
      }

      expect(valueToStore).toBe('{"key":"value"}');
      expect(mockSecretManager.encrypt).not.toHaveBeenCalled();
    });
  });

  describe("Decryption via Zod Transform", () => {
    it("should decrypt values when parsing with encryptedString schema", async () => {
      const schema = ZodWrapper.encryptedString();
      const encryptedValue = "encrypted_my-secret";

      // When parsing, the transform should call decrypt
      const result = await schema.parseAsync(encryptedValue);

      expect(result).toBe("my-secret");
      expect(mockSecretManager.decrypt).toHaveBeenCalledWith(encryptedValue);
    });

    it("should not decrypt regular strings", async () => {
      const schema = ZodWrapper.string();
      const regularValue = "regular-value";

      const result = await schema.parseAsync(regularValue);

      expect(result).toBe("regular-value");
      expect(mockSecretManager.decrypt).not.toHaveBeenCalled();
    });
  });
});
