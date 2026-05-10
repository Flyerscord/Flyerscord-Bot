import { BuildExtraConfigColumns, NonArray } from "drizzle-orm";
import {
  pgTable,
  PgColumnBuilderBase,
  pgEnum,
  PgTableExtraConfigValue,
  PgTable,
  PgEnumObject,
  PgColumn,
  text,
  timestamp,
  integer,
  boolean,
  doublePrecision,
} from "drizzle-orm/pg-core";
import { Modules } from "@modules/Modules";

type SnakeCase<T extends string> = T extends `${infer First}${infer Rest}`
  ? First extends Lowercase<First>
    ? `${First}${SnakeCase<Rest>}`
    : never
  : T;

type ModuleTableName = `${Lowercase<Modules>}__${SnakeCase<string>}`;
type ModuleEnumName = `${Lowercase<Modules>}__${SnakeCase<string>}_type`;

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export type TableEnumRecord = Record<string, PgTable | PgEnumObject<any>>;

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

export type StateTable = PgTable & { key: PgColumn; updatedAt: PgColumn };

export type StateValueType = "string" | "integer" | "boolean" | "number" | "date";

const STATE_VALUE_BUILDERS: Record<StateValueType, (name: string) => PgColumnBuilderBase> = {
  string: (name) => text(name),
  integer: (name) => integer(name),
  boolean: (name) => boolean(name),
  number: (name) => doublePrecision(name),
  date: (name) => timestamp(name),
};

/**
 * Creates a state table with a key, updatedAt, and typed value columns.
 * Each row stores a value in exactly one *_value column; the rest are null.
 *
 * @param name - Table name following the module__table_name convention
 * @param valueTypes - List of value column types to include (e.g. ["string", "integer"])
 *
 * @example
 * ```typescript
 * export const myState = createStateTable("mymodule", ["string", "boolean"]);
 * // produces table "mymodule__state" with columns: key, updatedAt, stringValue, booleanValue
 * ```
 */
// eslint-disable-next-line @typescript-eslint/explicit-function-return-type, @typescript-eslint/explicit-module-boundary-types
export function createStateTable<TModule extends Lowercase<Modules>, const T extends readonly StateValueType[]>(moduleName: TModule, valueTypes: T) {
  const dynamicColumns = Object.fromEntries(valueTypes.map((type) => [`${type}Value`, STATE_VALUE_BUILDERS[type](`${type}_value`)])) as Record<
    `${T[number]}Value`,
    PgColumnBuilderBase
  >;

  return pgTable(`${moduleName}__state` as `${TModule}__state`, {
    key: text("key").primaryKey(),
    updatedAt: timestamp("updated_at").defaultNow().notNull(),
    ...dynamicColumns,
  });
}
