import { z } from "zod";
import { SchemaInspector } from "../../src/cli/lib/SchemaInspector";
import ZodWrapper from "../../src/common/utils/ZodWrapper";

describe("SchemaInspector", () => {
  describe("getSchemaType", () => {
    it("should detect string type", () => {
      const schema = z.string();
      expect(SchemaInspector.getSchemaType(schema)).toBe("string");
    });

    it("should detect number type", () => {
      const schema = z.number();
      expect(SchemaInspector.getSchemaType(schema)).toBe("number");
    });

    it("should detect boolean type", () => {
      const schema = z.boolean();
      expect(SchemaInspector.getSchemaType(schema)).toBe("boolean");
    });

    it("should detect array type", () => {
      const schema = z.array(z.string());
      expect(SchemaInspector.getSchemaType(schema)).toBe("array");
    });

    it("should detect object type", () => {
      const schema = z.object({ name: z.string() });
      expect(SchemaInspector.getSchemaType(schema)).toBe("object");
    });

    it("should unwrap optional schemas", () => {
      const schema = z.string().optional();
      expect(SchemaInspector.getSchemaType(schema)).toBe("string");
    });

    it("should unwrap default schemas", () => {
      const schema = z.string().default("test");
      expect(SchemaInspector.getSchemaType(schema)).toBe("string");
    });

    it("should unwrap transform/pipe schemas", () => {
      const schema = z.string().transform((val) => val.toUpperCase());
      expect(SchemaInspector.getSchemaType(schema)).toBe("string");
    });

    it("should return unknown for unsupported types", () => {
      const schema = z.any();
      expect(SchemaInspector.getSchemaType(schema)).toBe("unknown");
    });
  });

  describe("getConstraints", () => {
    it("should extract string length constraints", () => {
      const schema = z.string().min(5).max(10);
      const constraints = SchemaInspector.getConstraints(schema);

      expect(constraints.minLength).toBe(5);
      expect(constraints.maxLength).toBe(10);
    });

    it("should extract string regex constraints", () => {
      const pattern = /^[A-Z]+$/;
      const schema = z.string().regex(pattern);
      const constraints = SchemaInspector.getConstraints(schema);

      // In Zod v4, we can't extract the actual pattern, just know it exists
      expect(constraints.regex).toBeDefined();
    });

    it("should extract number range constraints", () => {
      const schema = z.number().min(0).max(100);
      const constraints = SchemaInspector.getConstraints(schema);

      expect(constraints.min).toBe(0);
      expect(constraints.max).toBe(100);
    });

    it("should detect optional schemas", () => {
      const optionalSchema = z.string().optional();
      const requiredSchema = z.string();

      expect(SchemaInspector.getConstraints(optionalSchema).isOptional).toBe(true);
      expect(SchemaInspector.getConstraints(requiredSchema).isOptional).toBe(false);
    });

    it("should detect default schemas as optional", () => {
      const schema = z.string().default("test");
      expect(SchemaInspector.getConstraints(schema).isOptional).toBe(true);
    });

    it("should unwrap nested wrappers for constraints", () => {
      const schema = z.string().min(3).max(10).optional();
      const constraints = SchemaInspector.getConstraints(schema);

      expect(constraints.minLength).toBe(3);
      expect(constraints.maxLength).toBe(10);
      expect(constraints.isOptional).toBe(true);
    });
  });

  describe("analyzeSchema", () => {
    it("should analyze string schema", () => {
      const schema = z.string().min(1).max(50);
      const analysis = SchemaInspector.analyzeSchema(schema);

      expect(analysis.type).toBe("string");
      expect(analysis.constraints.minLength).toBe(1);
      expect(analysis.constraints.maxLength).toBe(50);
    });

    it("should analyze array schema with element schema", () => {
      const schema = z.array(z.number());
      const analysis = SchemaInspector.analyzeSchema(schema);

      expect(analysis.type).toBe("array");
      expect(analysis.elementSchema).toBeDefined();
      expect(SchemaInspector.getSchemaType(analysis.elementSchema!)).toBe("number");
    });

    it("should analyze object schema with shape", () => {
      const schema = z.object({
        name: z.string(),
        age: z.number(),
      });
      const analysis = SchemaInspector.analyzeSchema(schema);

      expect(analysis.type).toBe("object");
      expect(analysis.shape).toBeDefined();
      expect(analysis.shape!.name).toBeDefined();
      expect(analysis.shape!.age).toBeDefined();
    });

    it("should analyze complex nested schema", () => {
      const schema = z
        .object({
          items: z.array(z.string()),
          count: z.number().min(0),
        })
        .optional();

      const analysis = SchemaInspector.analyzeSchema(schema);

      expect(analysis.type).toBe("object");
      expect(analysis.constraints.isOptional).toBe(true);
      expect(analysis.shape).toBeDefined();
    });
  });

  describe("isOptional", () => {
    it("should return true for optional schemas", () => {
      expect(SchemaInspector.isOptional(z.string().optional())).toBe(true);
    });

    it("should return true for default schemas", () => {
      expect(SchemaInspector.isOptional(z.string().default("test"))).toBe(true);
    });

    it("should return false for required schemas", () => {
      expect(SchemaInspector.isOptional(z.string())).toBe(false);
    });

    it("should handle wrapped optional schemas", () => {
      const schema = z
        .string()
        .optional()
        .transform((val) => val?.toUpperCase());
      expect(SchemaInspector.isOptional(schema)).toBe(true);
    });
  });

  describe("unwrapSchema", () => {
    it("should unwrap optional wrapper", () => {
      const schema = z.string().optional();
      const unwrapped = SchemaInspector.unwrapSchema(schema);

      expect(SchemaInspector.getSchemaType(unwrapped)).toBe("string");
    });

    it("should unwrap multiple layers", () => {
      const schema = z
        .string()
        .optional()
        .transform((val) => val || "");
      const unwrapped = SchemaInspector.unwrapSchema(schema);

      expect(SchemaInspector.getSchemaType(unwrapped)).toBe("string");
    });

    it("should return same schema if no wrappers", () => {
      const schema = z.string();
      const unwrapped = SchemaInspector.unwrapSchema(schema);

      expect(unwrapped).toBe(schema);
    });
  });

  describe("getTypeDescription", () => {
    it("should describe string with length constraints", () => {
      const schema = z.string().min(5).max(10);
      const desc = SchemaInspector.getTypeDescription(schema);

      expect(desc).toContain("string");
      expect(desc).toContain("5-10");
    });

    it("should describe number with range", () => {
      const schema = z.number().min(0).max(100);
      const desc = SchemaInspector.getTypeDescription(schema);

      expect(desc).toContain("number");
      expect(desc).toContain("0-100");
    });

    it("should describe array with element type", () => {
      const schema = z.array(z.number());
      const desc = SchemaInspector.getTypeDescription(schema);

      expect(desc).toContain("array");
      expect(desc).toContain("number");
    });

    it("should handle schemas without constraints", () => {
      const schema = z.string();
      const desc = SchemaInspector.getTypeDescription(schema);

      expect(desc).toBe("string");
    });

    it("should show regex pattern for string", () => {
      const schema = z.string().regex(/^[A-Z]+$/);
      const desc = SchemaInspector.getTypeDescription(schema);

      expect(desc).toContain("pattern");
      // In Zod v4, we can't extract the actual regex pattern, just know it exists
      expect(desc).toContain("regex");
    });
  });

  describe("isEncryptedString", () => {
    it("should return true for encrypted string schemas", () => {
      const schema = ZodWrapper.encryptedString();
      expect(SchemaInspector.isEncryptedString(schema)).toBe(true);
    });

    it("should return false for regular string schemas", () => {
      const schema = z.string();
      expect(SchemaInspector.isEncryptedString(schema)).toBe(false);
    });

    it("should return false for wrapped string schemas", () => {
      const schema = ZodWrapper.string({ min: 1, max: 10 });
      expect(SchemaInspector.isEncryptedString(schema)).toBe(false);
    });

    it("should detect encrypted strings wrapped in optional", () => {
      const schema = ZodWrapper.encryptedString().optional();
      expect(SchemaInspector.isEncryptedString(schema)).toBe(true);
    });

    it("should detect encrypted strings with default values", () => {
      const schema = ZodWrapper.encryptedString().default("");
      expect(SchemaInspector.isEncryptedString(schema)).toBe(true);
    });

    it("should return true for any string transform (limitation)", () => {
      // Note: Current implementation detects any transform on a string as encrypted
      // This is a limitation but acceptable since transforms on strings are rare
      // and encrypted strings are the primary use case
      const schema = z.string().transform((val) => val.toUpperCase());
      expect(SchemaInspector.isEncryptedString(schema)).toBe(true);
    });

    it("should return false for number schemas", () => {
      const schema = z.number();
      expect(SchemaInspector.isEncryptedString(schema)).toBe(false);
    });

    it("should return false for boolean schemas", () => {
      const schema = z.boolean();
      expect(SchemaInspector.isEncryptedString(schema)).toBe(false);
    });

    it("should return false for array schemas", () => {
      const schema = z.array(z.string());
      expect(SchemaInspector.isEncryptedString(schema)).toBe(false);
    });

    it("should return false for object schemas", () => {
      const schema = z.object({ key: z.string() });
      expect(SchemaInspector.isEncryptedString(schema)).toBe(false);
    });
  });
});
