import Stumper, { LOG_LEVEL } from "stumper";
import Config from "../config/Config";
import ModuleManager from "../managers/ModuleManager";
import CustomCommandsModule from "@root/src/modules/customCommands/CustomCommandsModule";
import DaysUntilModule from "@root/src/modules/daysUntil/DaysUntilModule";
import GameDayPostsModule from "@root/src/modules/gamedayPosts/GameDayPostsModule";
import LevelsModule from "@root/src/modules/levels/LevelsModule";
import BlueSkyModule from "@root/src/modules/bluesky/BlueSkyModule";
import PinsModule from "@root/src/modules/pins/PinsModule";
import PlayerEmojisModule from "@root/src/modules/playerEmojis/PlayerEmojisModule";
import ReactionRoleModule from "@root/src/modules/reactionRole/ReactionRoleModule";
import RulesModule from "@root/src/modules/rules/RulesModule";

import BlueSkyNormalize from "@root/src/modules/bluesky/db/migration/normalize";
import DaysUntilNormalize from "@root/src/modules/daysUntil/db/migration/normalize";
import GameDayPostsNormalize from "@root/src/modules/gamedayPosts/db/migration/normalize";
import LevelsNormalize from "@root/src/modules/levels/db/migration/normalize";
import PinsNormalize from "@root/src/modules/pins/db/migration/normalize";
import PlayerEmojisNormalize from "@root/src/modules/playerEmojis/db/migration/normalize";
import ReactionRoleNormalize from "@root/src/modules/reactionRole/db/migration/normalize";
import RulesNormalize from "@root/src/modules/rules/db/migration/normalize";
import VisitorRoleNormalize from "@root/src/modules/visitorRole/db/migration/normalize";
import { getDb } from "../db/db";
import SchemaManager from "../managers/SchemaManager";
import { pushSchema } from "drizzle-kit/api";
import AccountHistoryDB from "@root/src/modules/bluesky/providers/AccountHistory.Database";
import BlueSkyDB from "@root/src/modules/bluesky/providers/BlueSky.Database";
import CustomCommandsDB from "@root/src/modules/customCommands/providers/CustomCommands.Database";
import DaysUntilDB from "@root/src/modules/daysUntil/providers/DaysUtil.Database";
import GameDayPostsDB from "@root/src/modules/gamedayPosts/providers/GameDayPosts.Database";
import LevelExpDB from "@root/src/modules/levels/providers/LevelExp.Database";
import LevelsDB from "@root/src/modules/levels/providers/Levels.Database";
import PinsDB from "@root/src/modules/pins/providers/Pins.Database";
import PlayerEmojisDB from "@root/src/modules/playerEmojis/providers/PlayerEmojis.Database";
import ReactionMessageDB from "@root/src/modules/reactionRole/providers/ReactionMessage.Database";
import RuleMessagesDB from "@root/src/modules/rules/providers/RuleMessages.Database";
import RulesDB from "@root/src/modules/rules/providers/Rules.Database";
import Database from "../providers/Database";
import GlobalDB from "../providers/Global.Database";
import VisitorRoleModule from "@root/src/modules/visitorRole/VisitorRoleModule";
import CommonModule from "../CommonModule";

async function main(): Promise<void> {
  const startTime = Date.now();
  Stumper.setConfig({ logLevel: LOG_LEVEL.ALL });

  const config = Config.loadConfig();
  const moduleManager = ModuleManager.getInstance();
  const schemaManager = SchemaManager.getInstance();

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
  ];

  await moduleManager.addModule(CommonModule.getInstance(config), false);
  await moduleManager.addModule(CustomCommandsModule.getInstance(config), false);

  await moduleManager.addModule(DaysUntilModule.getInstance(config), false);
  await moduleManager.addModule(GameDayPostsModule.getInstance(config), false);
  await moduleManager.addModule(LevelsModule.getInstance(config), false);
  await moduleManager.addModule(PinsModule.getInstance(config), false);
  await moduleManager.addModule(PlayerEmojisModule.getInstance(config), false);
  await moduleManager.addModule(ReactionRoleModule.getInstance(config), false);
  await moduleManager.addModule(RulesModule.getInstance(config), false);
  await moduleManager.addModule(BlueSkyModule.getInstance(config), false);
  await moduleManager.addModule(VisitorRoleModule.getInstance(config), false);

  Stumper.info("Registering raw table schemas...", "Migration:Schema");

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

  try {
    const db = getDb(false); // Use direct connection for schema changes
    const schemaManager = SchemaManager.getInstance();
    const schema = schemaManager.getSchema();

    // Use drizzle-kit to create tables from schema
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const { apply } = await pushSchema(schema, db as any);
    await apply();

    Stumper.info("Successfully created tables in database", "Migration:Schema");
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : String(error);
    Stumper.caughtError(error, "Migration:Schema");
    throw new Error(`Failed to create tables in database: ${errorMessage}`);
  }

  // Create all normalizes
  const normalizes = [
    new BlueSkyNormalize(),
    new DaysUntilNormalize(),
    new GameDayPostsNormalize(),
    new LevelsNormalize(),
    new PinsNormalize(),
    new PlayerEmojisNormalize(),
    new ReactionRoleNormalize(),
    new RulesNormalize(),
    new VisitorRoleNormalize(),
  ];

  let errorCount = 0;
  // Run all normalizes and validate afterwards
  for (const normalize of normalizes) {
    try {
      await normalize.normalize();
      const result = await normalize.validate();
      if (!result) {
        errorCount++;
      }
    } catch (error) {
      Stumper.caughtError(error, "Migration:Normalize");
      errorCount++;
    }
  }

  if (errorCount > 0) {
    Stumper.error(`Normalization failed for ${errorCount} tables`, "Migration:Normalize");
    const duration = ((Date.now() - startTime) / 1000).toFixed(2);
    Stumper.error(`Normalization failed in ${duration}s`, "Migration:Normalize");
    process.exit(1);
  }

  Stumper.success("Normalization completed successfully", "Migration:Normalize");
  const duration = ((Date.now() - startTime) / 1000).toFixed(2);
  Stumper.success(`Normalization completed successfully in ${duration}s`, "Migration:Normalize");
  process.exit(0);
}

void main();
