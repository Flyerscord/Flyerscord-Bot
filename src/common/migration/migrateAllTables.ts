import SchemaManager from "@common/managers/SchemaManager";
import { getDb } from "@common/db/db";
import Stumper from "stumper";
import Dump from "@common/migration/Dump";
import { pushSchema } from "drizzle-kit/api";

// Import all Database classes
import GlobalDB from "@common/providers/Global.Database";
import AccountHistoryDB from "@modules/bluesky/providers/AccountHistory.Database";
import BlueSkyDB from "@modules/bluesky/providers/BlueSky.Database";
import CustomCommandsDB from "@modules/customCommands/providers/CustomCommands.Database";
import DaysUntilDB from "@modules/daysUntil/providers/DaysUtil.Database";
import GameDayPostsDB from "@modules/gamedayPosts/providers/GameDayPosts.Database";
import LevelExpDB from "@modules/levels/providers/LevelExp.Database";
import LevelsDB from "@modules/levels/providers/Levels.Database";
import PinsDB from "@modules/pins/providers/Pins.Database";
import PlayerEmojisDB from "@modules/playerEmojis/providers/PlayerEmojis.Database";
import ReactionMessageDB from "@modules/reactionRole/providers/ReactionMessage.Database";
import RuleMessagesDB from "@modules/rules/providers/RuleMessages.Database";
import RulesDB from "@modules/rules/providers/Rules.Database";
import UserManagementDB from "@modules/userManagement/providers/UserManagement.Database";
import Database from "../providers/Database";

/**
 * Complete migration script to dump all Enmap tables to PostgreSQL
 * This script handles the full migration process:
 * 1. Register all raw table schemas
 * 2. Dump all Enmap data to raw tables
 * 3. Provide progress tracking and error handling
 */

// Database configurations - maps display names to their database instances
const DATABASE_CONFIGS: { displayName: string; instance: () => Database }[] = [
  { displayName: "Global", instance: () => GlobalDB.getInstance() },
  { displayName: "AccountHistory", instance: () => AccountHistoryDB.getInstance() },
  { displayName: "BlueSky", instance: () => BlueSkyDB.getInstance() },
  { displayName: "CustomCommands", instance: () => CustomCommandsDB.getInstance() },
  { displayName: "DaysUntil", instance: () => DaysUntilDB.getInstance() },
  { displayName: "GameDayPosts", instance: () => GameDayPostsDB.getInstance() },
  { displayName: "LevelExp", instance: () => LevelExpDB.getInstance() },
  { displayName: "Levels", instance: () => LevelsDB.getInstance() },
  { displayName: "Pins", instance: () => PinsDB.getInstance() },
  { displayName: "PlayerEmojis", instance: () => PlayerEmojisDB.getInstance() },
  { displayName: "ReactionMessage", instance: () => ReactionMessageDB.getInstance() },
  { displayName: "RuleMessages", instance: () => RuleMessagesDB.getInstance() },
  { displayName: "Rules", instance: () => RulesDB.getInstance() },
  { displayName: "UserManagement", instance: () => UserManagementDB.getInstance() },
];

/**
 * Main migration function - migrates all Enmap tables to PostgreSQL
 */
async function migrateAllTables(): Promise<void> {
  const startTime = Date.now();

  try {
    Stumper.info("Starting complete Enmap to PostgreSQL migration", "Migration:All");

    // Step 1: Register all raw table schemas
    await registerAllRawSchemas();

    // Step 2: Perform data migration for all tables
    await migrateAllData();

    const duration = ((Date.now() - startTime) / 1000).toFixed(2);
    Stumper.info(`Migration completed successfully in ${duration}s`, "Migration:All");
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : String(error);
    Stumper.error(`Migration failed: ${errorMessage}`, "Migration:All");
    throw error;
  }
}

/**
 * Register raw table schemas for all database tables
 */
async function registerAllRawSchemas(): Promise<void> {
  Stumper.info("Registering raw table schemas...", "Migration:Schema");

  const schemaManager = SchemaManager.getInstance();

  // Get actual database names from the Database instances
  const tableNames = DATABASE_CONFIGS.map((config) => {
    const dbInstance = config.instance();
    return dbInstance.getName();
  });

  const success = schemaManager.registerRawTables(tableNames);

  if (!success) {
    throw new Error("Failed to register raw table schemas");
  }

  Stumper.info(`Registered ${tableNames.length} raw table schemas`, "Migration:Schema");
  tableNames.forEach((name) => {
    Stumper.info(`   - raw_${name}`, "Migration:Schema");
  });

  // Create tables in the database
  await createRawTablesInDatabase();
}

async function createRawTablesInDatabase(): Promise<void> {
  Stumper.info("Creating raw tables in PostgreSQL database...", "Migration:Schema");

  try {
    const db = getDb(false); // Use direct connection for schema changes
    const schemaManager = SchemaManager.getInstance();
    const schema = schemaManager.getSchema();

    // Use drizzle-kit to create tables from schema
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const { apply } = await pushSchema(schema, db as any);
    await apply();

    Stumper.info("Successfully created raw tables in database", "Migration:Schema");
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : String(error);
    Stumper.error(`Failed to create raw tables: ${errorMessage}`, "Migration:Schema");
    throw new Error(`Failed to create raw tables in database: ${errorMessage}`);
  }
}

/**
 * Migrate data from all Enmap databases to PostgreSQL raw tables
 */
async function migrateAllData(): Promise<void> {
  Stumper.info("Starting data migration for all tables...", "Migration:Data");

  let successCount = 0;
  let errorCount = 0;

  for (const config of DATABASE_CONFIGS) {
    try {
      await migrateSingleTable(config.displayName, config.instance);
      successCount++;
    } catch (error) {
      errorCount++;
      const errorMessage = error instanceof Error ? error.message : String(error);
      Stumper.error(`Failed to migrate ${config.displayName}: ${errorMessage}`, "Migration:Data");
      // Continue with other tables even if one fails
    }
  }

  Stumper.info(`Migration summary: ${successCount} successful, ${errorCount} failed`, "Migration:Data");

  if (errorCount > 0) {
    throw new Error(`Migration completed with ${errorCount} errors`);
  }
}

/**
 * Migrate a single database table
 */
// eslint-disable-next-line @typescript-eslint/no-explicit-any
async function migrateSingleTable(displayName: string, getInstance: () => any): Promise<void> {
  Stumper.info(`Migrating ${displayName}...`, "Migration:Data");

  const database = getInstance();
  const recordCount = database.getNumOfKeys();

  if (recordCount === 0) {
    Stumper.info(`${displayName} is empty, skipping`, "Migration:Data");
    return;
  }

  const dump = new Dump(database);
  await dump.dumpEnmapToRaw(getDb(false));

  // Use actual database name for the raw table reference
  const actualTableName = database.getName();
  Stumper.info(`${displayName}: migrated ${recordCount} records to raw_${actualTableName}`, "Migration:Data");
}

/**
 * Get migration statistics
 */
function getMigrationStats(): { totalTables: number; tableNames: string[] } {
  return {
    totalTables: DATABASE_CONFIGS.length,
    tableNames: DATABASE_CONFIGS.map((config) => config.displayName),
  };
}

/**
 * Selective migration - migrate only specific tables
 */
async function migrateSelectedTables(selectedDisplayNames: string[]): Promise<void> {
  Stumper.info(`Starting selective migration for: ${selectedDisplayNames.join(", ")}`, "Migration:Selective");

  // Filter configurations to only include selected tables
  const selectedConfigs = DATABASE_CONFIGS.filter((config) => selectedDisplayNames.includes(config.displayName));

  if (selectedConfigs.length === 0) {
    throw new Error("No valid tables selected for migration");
  }

  // Get actual database names for schema registration
  const selectedTableNames = selectedConfigs.map((config) => {
    const dbInstance = config.instance();
    return dbInstance.getName();
  });

  // Register schemas for selected tables only
  const schemaManager = SchemaManager.getInstance();
  const success = schemaManager.registerRawTables(selectedTableNames);

  if (!success) {
    throw new Error("Failed to register raw table schemas for selected tables");
  }

  // Create tables in the database
  await createRawTablesInDatabase();

  // Migrate selected tables
  for (const config of selectedConfigs) {
    await migrateSingleTable(config.displayName, config.instance);
  }

  Stumper.info(`Selective migration completed for ${selectedConfigs.length} tables`, "Migration:Selective");
}

// Export functions for use
export { migrateAllTables, migrateSelectedTables, getMigrationStats, DATABASE_CONFIGS };

// If this script is run directly, execute the full migration
if (require.main === module) {
  migrateAllTables()
    .then(() => {
      Stumper.info("Migration script completed", "Migration");
      process.exit(0);
    })
    .catch((error) => {
      Stumper.error(`Migration script failed: ${error.message}`, "Migration");
      process.exit(1);
    });
}
