import type { z } from "zod";
import type { IModuleConfigSchema } from "@common/models/Module";
import type { Modules } from "@modules/Modules";

// Extended config type used by ConfigManager
export interface IConfig<TSchema extends z.ZodType = z.ZodType> extends Omit<IModuleConfigSchema, "schema"> {
  schema: TSchema;
  rawValue?: string; // Unparsed value from database for comparison
  value?: z.infer<TSchema>; // Parsed and validated value
}

export type SchemaType = "string" | "number" | "boolean" | "array" | "object" | "unknown";

export interface SchemaConstraints {
  minLength?: number;
  maxLength?: number;
  min?: number;
  max?: number;
  regex?: RegExp;
  isOptional: boolean;
  isSecret: boolean;
}

export interface ConfigSchemaInfo {
  module: Modules;
  key: string;
  schema: IModuleConfigSchema;
  type: SchemaType;
  constraints: SchemaConstraints;
}

export interface ViewOptions {
  module?: Modules;
  key?: string;
}

export interface SetOptions {
  module?: Modules;
  key?: string;
}

export interface SchemaAnalysis {
  type: SchemaType;
  constraints: SchemaConstraints;
  elementSchema?: z.ZodType; // For arrays
  shape?: Record<string, z.ZodType>; // For objects
}
