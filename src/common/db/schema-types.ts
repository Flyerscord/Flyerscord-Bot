import { pgTable, PgColumnBuilderBase, pgEnum } from "drizzle-orm/pg-core";

type SnakeCase<T extends string> = T extends `${infer First}${infer Rest}`
  ? First extends Lowercase<First>
    ? `${First}${SnakeCase<Rest>}`
    : never
  : T;

type ModuleTableName = `${string}__${SnakeCase<string>}`;
type ModuleEnumName = `${string}__${SnakeCase<string>}`;

/**
 * Wrapper around pgTable that enforces module__table naming convention.
 *
 * @param name - Table name following the pattern: module__table_name (snake_case with double underscore)
 * @param columns - Column definitions for the table
 * @returns PgTableWithColumns instance
 *
 * @example
 * ```typescript
 * export const blueskyState = createModuleTable("bluesky__state", {
 *   key: varchar("key", { length: 255 }).primaryKey(),
 *   value: text("value").notNull(),
 * });
 * ```
 */
// eslint-disable-next-line @typescript-eslint/explicit-function-return-type, @typescript-eslint/explicit-module-boundary-types
export function createModuleTable<TName extends ModuleTableName, TColumns extends Record<string, PgColumnBuilderBase>>(
  name: TName,
  columns: TColumns,
) {
  return pgTable(name, columns);
}

/**
 * Wrapper around pgEnum that enforces module__enum naming convention.
 *
 * @param name - Enum name following the pattern: module__enum_name (snake_case with double underscore)
 * @param values - Array of enum values
 * @returns PgEnum instance
 *
 * @example
 * ```typescript
 * export const actionTypeEnum = createModuleEnum("bluesky__action_type", ["ADD", "REMOVE"] as const);
 * ```
 */
// eslint-disable-next-line @typescript-eslint/explicit-function-return-type, @typescript-eslint/explicit-module-boundary-types
export function createModuleEnum<TName extends ModuleEnumName, T extends Readonly<[string, ...string[]]>>(name: TName, values: T) {
  return pgEnum(name, values);
}
