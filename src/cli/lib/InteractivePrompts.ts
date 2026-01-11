import inquirer from "inquirer";
import { z } from "zod";
import chalk from "chalk";
import type { SchemaConstraints } from "@cli/lib/types";
import { SchemaInspector } from "@cli/lib/SchemaInspector";

export class InteractivePrompts {
  /**
   * Prompt for a value based on the Zod schema type
   */
  static async promptForValue(schema: z.ZodType, currentValue: unknown, key: string): Promise<unknown> {
    const analysis = SchemaInspector.analyzeSchema(schema);

    switch (analysis.type) {
      case "string":
        return this.promptString(schema, typeof currentValue === "string" ? currentValue : undefined, key, analysis.constraints);
      case "number":
        return this.promptNumber(schema, typeof currentValue === "number" ? currentValue : undefined, key, analysis.constraints);
      case "boolean":
        return this.promptBoolean(typeof currentValue === "boolean" ? currentValue : undefined, key);
      case "array":
        return this.promptArray(analysis.elementSchema!, Array.isArray(currentValue) ? currentValue : undefined, key);
      case "object":
        return this.promptObject(
          analysis.shape!,
          typeof currentValue === "object" && currentValue !== null && !Array.isArray(currentValue)
            ? (currentValue as Record<string, unknown>)
            : undefined,
          key,
        );
      default:
        throw new Error(`Unsupported schema type: ${analysis.type}`);
    }
  }

  /**
   * Prompt for a string value
   */
  private static async promptString(
    schema: z.ZodType,
    currentValue: string | undefined,
    key: string,
    constraints: SchemaConstraints,
  ): Promise<string> {
    let message = `Enter value for ${key}`;

    // Add constraint hints
    if (constraints.minLength !== undefined || constraints.maxLength !== undefined) {
      const min = constraints.minLength ?? 0;
      const max = constraints.maxLength ?? "∞";
      message += chalk.dim(` (length: ${min}-${max})`);
    }
    if (constraints.regex) {
      message += chalk.dim(` (pattern: ${constraints.regex})`);
    }

    // For encrypted strings, validate against the base string schema, not the transform
    const isEncrypted = SchemaInspector.isEncryptedString(schema);
    const validationSchema = isEncrypted ? SchemaInspector.unwrapSchema(schema) : schema;

    const { value } = await inquirer.prompt([
      {
        type: "input",
        name: "value",
        message,
        default: currentValue,
        validate: async (input: string): Promise<boolean | string> => {
          try {
            await validationSchema.parseAsync(input);
            return true;
          } catch (error) {
            if (error && typeof error === "object" && "issues" in error) {
              const zodError = error as { issues: Array<{ message: string }> };
              return zodError.issues[0]?.message || "Invalid value";
            }
            return "Validation failed";
          }
        },
      },
    ]);

    return value;
  }

  /**
   * Prompt for a number value
   */
  private static async promptNumber(
    schema: z.ZodType,
    currentValue: number | undefined,
    key: string,
    constraints: SchemaConstraints,
  ): Promise<number> {
    let message = `Enter value for ${key}`;

    // Add constraint hints
    if (constraints.min !== undefined || constraints.max !== undefined) {
      const min = constraints.min ?? "-∞";
      const max = constraints.max ?? "∞";
      message += chalk.dim(` (range: ${min}-${max})`);
    }

    const { value } = await inquirer.prompt([
      {
        type: "number",
        name: "value",
        message,
        default: currentValue,
        validate: async (input: number): Promise<boolean | string> => {
          try {
            await schema.parseAsync(String(input));
            return true;
          } catch (error) {
            if (error && typeof error === "object" && "issues" in error) {
              const zodError = error as { issues: Array<{ message: string }> };
              return zodError.issues[0]?.message || "Invalid value";
            }
            return "Validation failed";
          }
        },
      },
    ]);

    return value;
  }

  /**
   * Prompt for a boolean value
   */
  private static async promptBoolean(currentValue: boolean | undefined, key: string): Promise<boolean> {
    const { value } = await inquirer.prompt([
      {
        type: "confirm",
        name: "value",
        message: `Enable ${key}?`,
        default: currentValue ?? false,
      },
    ]);

    return value;
  }

  /**
   * Prompt for an array value
   */
  private static async promptArray(elementSchema: z.ZodType, currentValue: unknown[] | undefined, key: string): Promise<unknown[]> {
    console.log(chalk.bold.cyan(`\n=== Building array for ${key} ===`));

    const items: unknown[] = currentValue ? [...currentValue] : [];

    // Show current items if any
    if (items.length > 0) {
      console.log(chalk.dim("Current items:"));
      items.forEach((item, index) => {
        console.log(chalk.dim(`  ${index + 1}. ${JSON.stringify(item)}`));
      });
    }

    let building = true;
    while (building) {
      const { action } = await inquirer.prompt([
        {
          type: "rawlist",
          name: "action",
          message: "What would you like to do?",
          choices: [
            { name: "Add item", value: "add" },
            { name: "Remove item", value: "remove", disabled: items.length === 0 },
            { name: "Done", value: "done" },
          ],
        },
      ]);

      switch (action) {
        case "add": {
          console.log(chalk.bold(`\n--- Item ${items.length + 1} ---`));
          const item = await this.promptForValue(elementSchema, undefined, `item ${items.length + 1}`);
          items.push(item);
          console.log(chalk.green("✓ Item added"));
          break;
        }
        case "remove": {
          const { indexToRemove } = await inquirer.prompt([
            {
              type: "rawlist",
              name: "indexToRemove",
              message: "Which item would you like to remove?",
              choices: items.map((item, index) => ({
                name: `${index + 1}. ${JSON.stringify(item)}`,
                value: index,
              })),
            },
          ]);
          items.splice(indexToRemove, 1);
          console.log(chalk.green("✓ Item removed"));
          break;
        }
        case "done":
          building = false;
          break;
      }
    }

    return items;
  }

  /**
   * Prompt for an object value
   */
  private static async promptObject(
    shape: Record<string, z.ZodType>,
    currentValue: Record<string, unknown> | undefined,
    key: string,
  ): Promise<Record<string, unknown>> {
    console.log(chalk.bold.cyan(`\n=== Building object for ${key} ===`));

    const obj: Record<string, unknown> = currentValue ? { ...currentValue } : {};

    for (const [propKey, propSchema] of Object.entries(shape)) {
      const propAnalysis = SchemaInspector.analyzeSchema(propSchema);
      const isOptional = propAnalysis.constraints.isOptional;

      // Show property info
      console.log(chalk.dim(`\nProperty: ${propKey} (${propAnalysis.type}${isOptional ? ", optional" : ", required"})`));

      // For optional properties, ask if they want to set it
      if (isOptional && !obj[propKey]) {
        const { shouldSet } = await inquirer.prompt([
          {
            type: "confirm",
            name: "shouldSet",
            message: `Set ${propKey}?`,
            default: false,
          },
        ]);

        if (!shouldSet) {
          continue;
        }
      }

      const propValue = await this.promptForValue(propSchema, obj[propKey], propKey);
      obj[propKey] = propValue;
    }

    return obj;
  }

  /**
   * Prompt for confirmation
   */
  static async confirm(message: string, defaultValue: boolean = true): Promise<boolean> {
    const { confirmed } = await inquirer.prompt([
      {
        type: "confirm",
        name: "confirmed",
        message,
        default: defaultValue,
      },
    ]);

    return confirmed;
  }

  /**
   * Prompt to select from a list
   */
  static async selectFromList<T>(message: string, choices: { name: string; value: T }[]): Promise<T> {
    const { selected } = await inquirer.prompt([
      {
        type: "rawlist",
        name: "selected",
        message,
        choices,
      },
    ]);

    return selected;
  }
}
