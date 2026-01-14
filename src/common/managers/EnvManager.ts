import Stumper from "stumper";
import { Singleton } from "../models/Singleton";

/**
 * Defines the environment variables required by the application and their types.
 */
const envVarDefinitions = {
  DISCORD_TOKEN: "string",
  DATABASE_URL_POOLED: "string",
  ENCRYPTION_KEY: "string",
  PRODUCTION_MODE: "boolean",
  ADVANCED_DEBUG: "boolean",
} as const;

/**
 * Maps environment variable keys to their TypeScript types.
 */
type EnvVarTypeMap = {
  [K in keyof typeof envVarDefinitions]: (typeof envVarDefinitions)[K] extends "string"
    ? string
    : (typeof envVarDefinitions)[K] extends "boolean"
      ? boolean
      : never;
};

/**
 * Union type of all valid environment variable keys.
 */
type EnvVarKey = keyof EnvVarTypeMap;

/**
 * Array of environment variable metadata used for validation.
 */
const envVars = Object.entries(envVarDefinitions).map(([key, type]) => ({
  key: key as EnvVarKey,
  type,
})) as { key: EnvVarKey; type: "string" | "boolean" }[];

/**
 * Represents an environment variable with its key and type.
 */
type EnvVar = { key: EnvVarKey; type: "string" | "boolean" };

/**
 * Manages environment variables for the application.
 * Validates required environment variables at startup and provides type-safe access.
 *
 * @extends Singleton
 *
 * @example
 * ```typescript
 * const envManager = EnvManager.getInstance();
 * const isValid = envManager.read();
 * if (isValid) {
 *   const token = envManager.get("DISCORD_TOKEN");
 *   const isProduction = envManager.get("PRODUCTION_MODE");
 * }
 * ```
 */
export default class EnvManager extends Singleton {
  private vars: Map<EnvVarKey, string | boolean> = new Map();

  constructor() {
    super();
  }

  /**
   * Reads and validates all required environment variables from process.env.
   * Missing variables are logged as errors.
   *
   * @returns {boolean} True if all required environment variables are present, false otherwise.
   *
   * @example
   * ```typescript
   * const envManager = EnvManager.getInstance();
   * if (!envManager.read()) {
   *   console.error("Missing required environment variables");
   *   process.exit(1);
   * }
   * ```
   */
  read(): boolean {
    const errors: string[] = [];
    for (const envVar of envVars) {
      const value = this.getVar(envVar.key);
      if (!value) {
        errors.push(envVar.key);
      } else {
        this.set(envVar, value);
      }
    }

    if (errors.length > 0) {
      Stumper.error(`Missing environment variables: ${errors.join(", ")}`, "common:EnvManager:validate");
      return false;
    }

    return true;
  }

  /**
   * Retrieves an environment variable value with type safety.
   *
   * @template K - The environment variable key type.
   * @param {K} key - The environment variable key to retrieve.
   * @returns {EnvVarTypeMap[K]} The environment variable value with the correct type (string or boolean).
   *
   * @example
   * ```typescript
   * const token = envManager.get("DISCORD_TOKEN"); // Returns string
   * const isProduction = envManager.get("PRODUCTION_MODE"); // Returns boolean
   * ```
   */
  get<K extends EnvVarKey>(key: K): EnvVarTypeMap[K] {
    if (!this.vars.has(key)) {
      throw new Error("You must read the environment variables before retrieving them");
    }
    return this.vars.get(key) as EnvVarTypeMap[K];
  }

  /**
   * Sets an environment variable value with type conversion.
   * Converts string values to boolean when the variable type is boolean.
   *
   * @private
   * @param {EnvVar} envVar - The environment variable metadata.
   * @param {string} value - The raw string value from process.env.
   */
  private set(envVar: EnvVar, value: string): void {
    if (envVar.type === "string") {
      this.vars.set(envVar.key, value);
    } else if (envVar.type === "boolean") {
      this.vars.set(envVar.key, value.toLowerCase() === "true");
    }
  }

  /**
   * Retrieves a raw environment variable value from process.env.
   *
   * @param {string} key - The environment variable key.
   * @returns {string | undefined} The raw environment variable value or undefined if not set.
   */
  getVar(key: string): string | undefined {
    return process.env[key];
  }
}
