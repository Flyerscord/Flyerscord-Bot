import { z } from "zod";
import type { SchemaType, SchemaConstraints, SchemaAnalysis } from "./types.js";

// Type guard to check if value is a ZodType
function isZodType(value: unknown): value is z.ZodType {
  return value !== null && typeof value === "object" && "_def" in value;
}

export class SchemaInspector {
  /**
   * Get the type of a Zod schema
   * Uses _def.type for Zod v4 compatibility
   */
  static getSchemaType(schema: z.ZodType): SchemaType {
    // eslint-disable-next-line @typescript-eslint/no-deprecated
    const def = (schema as z.ZodType & { _def: Record<string, unknown> })._def;
    const type = def.type || def.typeName; // Support both v4 (type) and v3 (typeName)

    // Handle wrapped types (optional, nullable, default, pipe, transform)
    if (type === "optional" || type === "nullable") {
      const innerType = def.innerType;
      if (isZodType(innerType)) {
        return this.getSchemaType(innerType);
      }
    }

    if (type === "default") {
      const innerType = def.innerType;
      if (isZodType(innerType)) {
        return this.getSchemaType(innerType);
      }
    }

    if (type === "pipe" || type === "transform") {
      const innerType = (def.in || def.schema || def.innerType) as unknown;
      if (isZodType(innerType)) {
        return this.getSchemaType(innerType);
      }
    }

    // Check for primitive types (Zod v4 uses lowercase)
    if (type === "string") return "string";
    if (type === "number") return "number";
    if (type === "boolean") return "boolean";
    if (type === "array") return "array";
    if (type === "object") return "object";

    return "unknown";
  }

  /**
   * Extract constraints from a Zod schema
   */
  static getConstraints(schema: z.ZodType): SchemaConstraints {
    const constraints: SchemaConstraints = {
      isOptional: this.isOptional(schema),
      isSecret: false, // Will be set by caller based on schema metadata
    };

    // Unwrap to get the inner schema
    const innerSchema = this.unwrapSchema(schema);
    const schemaType = this.getSchemaType(innerSchema);

    // Extract string constraints (Zod v4 uses top-level properties)
    if (schemaType === "string") {
      const s = innerSchema as z.ZodType & { minLength?: number; maxLength?: number; format?: string };
      if (s.minLength !== null && s.minLength !== undefined) {
        constraints.minLength = s.minLength;
      }
      if (s.maxLength !== null && s.maxLength !== undefined) {
        constraints.maxLength = s.maxLength;
      }
      if (s.format === "regex") {
        // In Zod v4, format indicates regex but pattern isn't easily accessible
        // We'll just indicate it's a regex pattern
        constraints.regex = /regex/; // Placeholder to indicate regex exists
      }
    }

    // Extract number constraints (Zod v4 uses top-level properties)
    if (schemaType === "number") {
      const n = innerSchema as z.ZodType & { minValue?: number; maxValue?: number };
      if (n.minValue !== null && n.minValue !== undefined) {
        constraints.min = n.minValue;
      }
      if (n.maxValue !== null && n.maxValue !== undefined) {
        constraints.max = n.maxValue;
      }
    }

    return constraints;
  }

  /**
   * Perform a complete analysis of a schema
   */
  static analyzeSchema(schema: z.ZodType): SchemaAnalysis {
    const type = this.getSchemaType(schema);
    const constraints = this.getConstraints(schema);

    const analysis: SchemaAnalysis = {
      type,
      constraints,
    };

    // For arrays, extract element schema
    if (type === "array") {
      const unwrapped = this.unwrapSchema(schema);
      // eslint-disable-next-line @typescript-eslint/no-deprecated
      const def = (unwrapped as z.ZodType & { _def: Record<string, unknown> })._def;
      if (def.type === "array") {
        // In Zod v4, array element type is in _def.element
        const element = def.element as unknown;
        if (isZodType(element)) {
          analysis.elementSchema = element;
        }
      }
    }

    // For objects, extract shape
    if (type === "object") {
      const unwrapped = this.unwrapSchema(schema);
      // eslint-disable-next-line @typescript-eslint/no-deprecated
      const def = (unwrapped as z.ZodType & { _def: Record<string, unknown> })._def;
      if (def.type === "object") {
        // In Zod v4, shape is directly in _def
        const shapeValue = def.shape;
        if (shapeValue && typeof shapeValue === "object") {
          analysis.shape = shapeValue as Record<string, z.ZodType>;
        }
      }
    }

    return analysis;
  }

  /**
   * Check if a schema is optional
   */
  static isOptional(schema: z.ZodType): boolean {
    // eslint-disable-next-line @typescript-eslint/no-deprecated
    const def = (schema as z.ZodType & { _def: Record<string, unknown> })._def;
    const type = def.type || def.typeName;

    if (type === "optional") return true;
    if (type === "default") return true;

    // Check wrapped schemas
    if (type === "pipe" || type === "transform") {
      const innerType = (def.in || def.schema || def.innerType) as unknown;
      if (isZodType(innerType)) {
        return this.isOptional(innerType);
      }
    }

    return false;
  }

  /**
   * Unwrap a schema to get the inner type (removing wrappers)
   */
  static unwrapSchema(schema: z.ZodType): z.ZodType {
    // eslint-disable-next-line @typescript-eslint/no-deprecated
    const def = (schema as z.ZodType & { _def: Record<string, unknown> })._def;
    const type = def.type || def.typeName;

    // Unwrap wrappers
    if (type === "optional" || type === "nullable" || type === "default") {
      const innerType = def.innerType as unknown;
      if (isZodType(innerType)) {
        return this.unwrapSchema(innerType);
      }
    }

    if (type === "pipe" || type === "transform") {
      const innerType = (def.in || def.schema || def.innerType) as unknown;
      if (isZodType(innerType)) {
        return this.unwrapSchema(innerType);
      }
    }

    return schema;
  }

  /**
   * Get a human-readable type description
   */
  static getTypeDescription(schema: z.ZodType): string {
    const type = this.getSchemaType(schema);
    const constraints = this.getConstraints(schema);

    let desc = type;

    if (type === "string") {
      if (constraints.minLength !== undefined || constraints.maxLength !== undefined) {
        const min = constraints.minLength ?? 0;
        const max = constraints.maxLength ?? "∞";
        desc += ` (length: ${min}-${max})`;
      }
      if (constraints.regex) {
        desc += ` (pattern: ${constraints.regex})`;
      }
    }

    if (type === "number") {
      if (constraints.min !== undefined || constraints.max !== undefined) {
        const min = constraints.min ?? "-∞";
        const max = constraints.max ?? "∞";
        desc += ` (range: ${min}-${max})`;
      }
    }

    if (type === "array") {
      const unwrapped = this.unwrapSchema(schema);
      // eslint-disable-next-line @typescript-eslint/no-deprecated
      const def = (unwrapped as z.ZodType & { _def: Record<string, unknown> })._def;
      const elementSchema = def.element as unknown;
      if (isZodType(elementSchema)) {
        const elementType = this.getSchemaType(elementSchema);
        desc += ` of ${elementType}`;
      }
    }

    return desc;
  }
}
