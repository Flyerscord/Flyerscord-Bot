import { BuildExtraConfigColumns, NonArray } from "drizzle-orm";
import { pgTable, PgColumnBuilderBase, pgEnum, PgTableExtraConfigValue, PgTable } from "drizzle-orm/pg-core";
import { Modules } from "@modules/Modules";

type SnakeCase<T extends string> = T extends `${infer First}${infer Rest}`
  ? First extends Lowercase<First>
    ? `${First}${SnakeCase<Rest>}`
    : never
  : T;

type ModuleTableName = `${Lowercase<Modules>}__${SnakeCase<string>}`;
type ModuleEnumName = `${Lowercase<Modules>}__${SnakeCase<string>}_type`;

export type TableEnumRecord = Record<string, PgTable>;

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
export function createModuleTable<TName extends ModuleTableName, TColumnsMap extends Record<string, PgColumnBuilderBase>>(
  name: TName,
  columns: TColumnsMap,
  extraConfig?: (self: BuildExtraConfigColumns<TName, TColumnsMap, "pg">) => PgTableExtraConfigValue[],
) {
  if (extraConfig) {
    return pgTable(name, columns, extraConfig);
  }
  return pgTable(name, columns);
}

/**
 * Wrapper around pgEnum that enforces module__enum naming convention.
 *
 * @param name - Enum name following the pattern: module__enum_name (snake_case with double underscore)
 * @param enumObj - TypeScript enum object
 * @returns PgEnumObject instance
 *
 * @example
 * ```typescript
 * enum ActionType { ADD = "ADD", REMOVE = "REMOVE" }
 * export const actionTypeEnum = createModuleEnum("bluesky__action_type", ActionType);
 * ```
 */
// eslint-disable-next-line @typescript-eslint/explicit-function-return-type, @typescript-eslint/explicit-module-boundary-types
export function createModuleEnum<TName extends ModuleEnumName, E extends Record<string, string>>(name: TName, enumObj: NonArray<E>) {
  return pgEnum(name, enumObj);
}
