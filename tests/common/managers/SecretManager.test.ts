// Mock EnvManager before importing SecretManager
const mockEnvManager: {
  get: jest.Mock<string | undefined, [string]>;
  getInstance: jest.Mock<typeof mockEnvManager, []>;
} = {
  get: jest.fn((key: string) => {
    if (key === "ENCRYPTION_KEY") {
      return "test-encryption-key-for-unit-tests";
    }
    return undefined;
  }),
  getInstance: jest.fn(function (this: typeof mockEnvManager) {
    return this;
  }),
};

// Bind getInstance to return mockEnvManager
mockEnvManager.getInstance = jest.fn(() => mockEnvManager);

jest.mock("@common/managers/EnvManager", () => ({
  __esModule: true,
  default: mockEnvManager,
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

describe("SecretManager", () => {
  let SecretManager: typeof import("@common/managers/SecretManager").default;

  beforeEach(async () => {
    jest.clearAllMocks();
    jest.resetModules();

    // Clear singleton instance
    const Singleton = await import("@common/models/Singleton");
    // @ts-expect-error - Accessing private static field for testing
    Singleton.Singleton.instances = new Map();

    // Re-import to get fresh instance
    const module = await import("@common/managers/SecretManager");
    SecretManager = module.default;
  });

  describe("singleton behavior", () => {
    it("should return the same instance on multiple getInstance calls", () => {
      const instance1 = SecretManager.getInstance();
      const instance2 = SecretManager.getInstance();

      expect(instance1).toBe(instance2);
    });
  });

  describe("encrypt", () => {
    it("should encrypt a string value", () => {
      const secretManager = SecretManager.getInstance();
      const plaintext = "my-secret-password";

      const encrypted = secretManager.encrypt(plaintext);

      expect(encrypted).toBeDefined();
      expect(encrypted).not.toBe(plaintext);
      expect(typeof encrypted).toBe("string");
    });

    it("should produce different ciphertexts for the same plaintext", () => {
      const secretManager = SecretManager.getInstance();
      const plaintext = "my-secret-password";

      const encrypted1 = secretManager.encrypt(plaintext);
      const encrypted2 = secretManager.encrypt(plaintext);

      // Should be different due to random IV
      expect(encrypted1).not.toBe(encrypted2);
    });

    it("should return encrypted value in the format iv:authTag:encrypted", () => {
      const secretManager = SecretManager.getInstance();
      const plaintext = "test";

      const encrypted = secretManager.encrypt(plaintext);

      // Should have exactly 3 parts separated by colons
      const parts = encrypted.split(":");
      expect(parts).toHaveLength(3);

      // Each part should be a valid hex string
      parts.forEach((part) => {
        expect(part).toMatch(/^[0-9a-f]+$/i);
      });
    });

    it("should encrypt empty string", () => {
      const secretManager = SecretManager.getInstance();
      const plaintext = "";

      const encrypted = secretManager.encrypt(plaintext);

      expect(encrypted).toBeDefined();
      expect(encrypted).not.toBe("");
      expect(encrypted.split(":")).toHaveLength(3);
    });

    it("should encrypt long strings", () => {
      const secretManager = SecretManager.getInstance();
      const plaintext = "a".repeat(1000);

      const encrypted = secretManager.encrypt(plaintext);

      expect(encrypted).toBeDefined();
      expect(encrypted.split(":")).toHaveLength(3);
    });

    it("should encrypt special characters", () => {
      const secretManager = SecretManager.getInstance();
      const plaintext = "!@#$%^&*()_+-=[]{}|;':\",./<>?`~";

      const encrypted = secretManager.encrypt(plaintext);

      expect(encrypted).toBeDefined();
      expect(encrypted.split(":")).toHaveLength(3);
    });

    it("should encrypt unicode characters", () => {
      const secretManager = SecretManager.getInstance();
      const plaintext = "Hello 世界 🌍 émojis";

      const encrypted = secretManager.encrypt(plaintext);

      expect(encrypted).toBeDefined();
      expect(encrypted.split(":")).toHaveLength(3);
    });
  });

  describe("decrypt", () => {
    it("should decrypt an encrypted value back to original", () => {
      const secretManager = SecretManager.getInstance();
      const plaintext = "my-secret-password";

      const encrypted = secretManager.encrypt(plaintext);
      const decrypted = secretManager.decrypt(encrypted);

      expect(decrypted).toBe(plaintext);
    });

    it("should decrypt empty string", () => {
      const secretManager = SecretManager.getInstance();
      const plaintext = "";

      const encrypted = secretManager.encrypt(plaintext);
      const decrypted = secretManager.decrypt(encrypted);

      expect(decrypted).toBe(plaintext);
    });

    it("should decrypt long strings", () => {
      const secretManager = SecretManager.getInstance();
      const plaintext = "a".repeat(1000);

      const encrypted = secretManager.encrypt(plaintext);
      const decrypted = secretManager.decrypt(encrypted);

      expect(decrypted).toBe(plaintext);
    });

    it("should decrypt special characters", () => {
      const secretManager = SecretManager.getInstance();
      const plaintext = "!@#$%^&*()_+-=[]{}|;':\",./<>?`~";

      const encrypted = secretManager.encrypt(plaintext);
      const decrypted = secretManager.decrypt(encrypted);

      expect(decrypted).toBe(plaintext);
    });

    it("should decrypt unicode characters", () => {
      const secretManager = SecretManager.getInstance();
      const plaintext = "Hello 世界 🌍 émojis";

      const encrypted = secretManager.encrypt(plaintext);
      const decrypted = secretManager.decrypt(encrypted);

      expect(decrypted).toBe(plaintext);
    });

    it("should throw error for invalid encrypted value format", () => {
      const secretManager = SecretManager.getInstance();
      const invalidValue = "not-a-valid-encrypted-value";

      expect(() => secretManager.decrypt(invalidValue)).toThrow("Failed to decrypt value");
      expect(mockStumper.caughtError).toHaveBeenCalled();
    });

    it("should throw error for encrypted value with wrong number of parts", () => {
      const secretManager = SecretManager.getInstance();
      const invalidValue = "part1:part2"; // Only 2 parts instead of 3

      expect(() => secretManager.decrypt(invalidValue)).toThrow("Failed to decrypt value");
      expect(mockStumper.caughtError).toHaveBeenCalled();
    });

    it("should throw error for encrypted value with too many parts", () => {
      const secretManager = SecretManager.getInstance();
      const invalidValue = "part1:part2:part3:part4"; // 4 parts instead of 3

      expect(() => secretManager.decrypt(invalidValue)).toThrow("Failed to decrypt value");
      expect(mockStumper.caughtError).toHaveBeenCalled();
    });

    it("should throw error for encrypted value with invalid hex", () => {
      const secretManager = SecretManager.getInstance();
      const invalidValue = "notHex:alsoNotHex:stillNotHex";

      expect(() => secretManager.decrypt(invalidValue)).toThrow("Failed to decrypt value");
      expect(mockStumper.caughtError).toHaveBeenCalled();
    });

    it("should throw error for tampered ciphertext", () => {
      const secretManager = SecretManager.getInstance();
      const plaintext = "secret";
      const encrypted = secretManager.encrypt(plaintext);

      // Tamper with the ciphertext part
      const parts = encrypted.split(":");
      parts[2] = parts[2].slice(0, -2) + "00"; // Change last byte
      const tampered = parts.join(":");

      expect(() => secretManager.decrypt(tampered)).toThrow("Failed to decrypt value");
      expect(mockStumper.caughtError).toHaveBeenCalled();
    });

    it("should throw error for tampered auth tag", () => {
      const secretManager = SecretManager.getInstance();
      const plaintext = "secret";
      const encrypted = secretManager.encrypt(plaintext);

      // Tamper with the auth tag
      const parts = encrypted.split(":");
      parts[1] = parts[1].slice(0, -2) + "00"; // Change last byte
      const tampered = parts.join(":");

      expect(() => secretManager.decrypt(tampered)).toThrow("Failed to decrypt value");
      expect(mockStumper.caughtError).toHaveBeenCalled();
    });

    it("should throw error for tampered IV", () => {
      const secretManager = SecretManager.getInstance();
      const plaintext = "secret";
      const encrypted = secretManager.encrypt(plaintext);

      // Tamper with the IV
      const parts = encrypted.split(":");
      parts[0] = parts[0].slice(0, -2) + "00"; // Change last byte
      const tampered = parts.join(":");

      expect(() => secretManager.decrypt(tampered)).toThrow("Failed to decrypt value");
      expect(mockStumper.caughtError).toHaveBeenCalled();
    });
  });

  describe("isEncrypted", () => {
    it("should return true for properly encrypted values", () => {
      const secretManager = SecretManager.getInstance();
      const plaintext = "my-secret";

      const encrypted = secretManager.encrypt(plaintext);

      expect(secretManager.isEncrypted(encrypted)).toBe(true);
    });

    it("should return false for plaintext values", () => {
      const secretManager = SecretManager.getInstance();
      const plaintext = "not-encrypted";

      expect(secretManager.isEncrypted(plaintext)).toBe(false);
    });

    it("should return false for empty string", () => {
      const secretManager = SecretManager.getInstance();

      expect(secretManager.isEncrypted("")).toBe(false);
    });

    it("should return false for values with wrong format", () => {
      const secretManager = SecretManager.getInstance();

      expect(secretManager.isEncrypted("part1:part2")).toBe(false);
      expect(secretManager.isEncrypted("part1:part2:part3:part4")).toBe(false);
      expect(secretManager.isEncrypted("no-colons")).toBe(false);
    });

    it("should return false for values with non-hex characters", () => {
      const secretManager = SecretManager.getInstance();

      expect(secretManager.isEncrypted("notHex:alsoNotHex:stillNotHex")).toBe(false);
      expect(secretManager.isEncrypted("abc:def:ghi")).toBe(false); // 'g', 'h', 'i' are not hex
    });

    it("should return true for valid hex format even if not actually encrypted by this manager", () => {
      const secretManager = SecretManager.getInstance();

      // Valid format but not actually encrypted by this SecretManager instance
      expect(secretManager.isEncrypted("abc123:def456:789abc")).toBe(true);
    });

    it("should handle case insensitivity in hex check", () => {
      const secretManager = SecretManager.getInstance();

      expect(secretManager.isEncrypted("ABC123:DEF456:789ABC")).toBe(true);
      expect(secretManager.isEncrypted("AbC123:dEf456:789AbC")).toBe(true);
    });
  });

  describe("encryption consistency", () => {
    it("should encrypt and decrypt multiple times correctly", () => {
      const secretManager = SecretManager.getInstance();
      const plaintext = "test-secret";

      for (let i = 0; i < 10; i++) {
        const encrypted = secretManager.encrypt(plaintext);
        const decrypted = secretManager.decrypt(encrypted);
        expect(decrypted).toBe(plaintext);
      }
    });

    it("should handle multiple different values", () => {
      const secretManager = SecretManager.getInstance();
      const values = ["secret1", "secret2", "secret3", "secret4", "secret5"];

      const encrypted = values.map((val) => secretManager.encrypt(val));
      const decrypted = encrypted.map((enc) => secretManager.decrypt(enc));

      expect(decrypted).toEqual(values);
    });
  });

  describe("key derivation", () => {
    it("should use the encryption key from environment", () => {
      SecretManager.getInstance();

      expect(mockEnvManager.get).toHaveBeenCalledWith("ENCRYPTION_KEY");
    });

    it("should derive key using scrypt with consistent salt", () => {
      const secretManager1 = SecretManager.getInstance();
      const plaintext = "test";
      const encrypted1 = secretManager1.encrypt(plaintext);

      // Clear singleton and create new instance
      jest.resetModules();
      const Singleton = require("@common/models/Singleton").Singleton;
      Singleton.instances = new Map();

      const SecretManagerModule = require("@common/managers/SecretManager");
      const secretManager2 = SecretManagerModule.default.getInstance();

      // Should be able to decrypt with new instance (same key derivation)
      const decrypted = secretManager2.decrypt(encrypted1);
      expect(decrypted).toBe(plaintext);
    });
  });

  describe("edge cases", () => {
    it("should handle strings with only whitespace", () => {
      const secretManager = SecretManager.getInstance();
      const plaintext = "   \n\t   ";

      const encrypted = secretManager.encrypt(plaintext);
      const decrypted = secretManager.decrypt(encrypted);

      expect(decrypted).toBe(plaintext);
    });

    it("should handle JSON strings", () => {
      const secretManager = SecretManager.getInstance();
      const plaintext = JSON.stringify({ key: "value", nested: { data: [1, 2, 3] } });

      const encrypted = secretManager.encrypt(plaintext);
      const decrypted = secretManager.decrypt(encrypted);

      expect(decrypted).toBe(plaintext);
      expect(JSON.parse(decrypted)).toEqual({ key: "value", nested: { data: [1, 2, 3] } });
    });

    it("should handle strings with newlines", () => {
      const secretManager = SecretManager.getInstance();
      const plaintext = "line1\nline2\nline3";

      const encrypted = secretManager.encrypt(plaintext);
      const decrypted = secretManager.decrypt(encrypted);

      expect(decrypted).toBe(plaintext);
    });
  });
});
