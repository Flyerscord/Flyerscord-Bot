import Config from "../config/Config";
import ModuleManager from "../managers/ModuleManager";
import { migrateAllTables } from "./migrateAllTables";
import CustomCommandsModule from "@root/src/modules/customCommands/CustomCommandsModule";
import DaysUntilModule from "@root/src/modules/daysUntil/DaysUntilModule";
import GameDayPostsModule from "@root/src/modules/gamedayPosts/GameDayPostsModule";
import LevelsModule from "@root/src/modules/levels/LevelsModule";
import BlueSkyModule from "@root/src/modules/bluesky/BlueSkyModule";
import PinsModule from "@root/src/modules/pins/PinsModule";
import PlayerEmojisModule from "@root/src/modules/playerEmojis/PlayerEmojisModule";
import ReactionRoleModule from "@root/src/modules/reactionRole/ReactionRoleModule";
import RulesModule from "@root/src/modules/rules/RulesModule";
import UserManagementModule from "@root/src/modules/userManagement/UserManagementModule";
import Stumper, { LOG_LEVEL } from "stumper";

async function main(): Promise<void> {
  Stumper.setConfig({ logLevel: LOG_LEVEL.ALL });

  const config = Config.loadConfig();
  const moduleManager = ModuleManager.getInstance();

  await moduleManager.addModule(CustomCommandsModule.getInstance(config), false);

  await moduleManager.addModule(DaysUntilModule.getInstance(config), false);
  await moduleManager.addModule(GameDayPostsModule.getInstance(config), false);
  await moduleManager.addModule(LevelsModule.getInstance(config), false);
  await moduleManager.addModule(PinsModule.getInstance(config), false);
  await moduleManager.addModule(PlayerEmojisModule.getInstance(config), false);
  await moduleManager.addModule(ReactionRoleModule.getInstance(config), false);
  await moduleManager.addModule(RulesModule.getInstance(config), false);
  await moduleManager.addModule(UserManagementModule.getInstance(config), false);
  await moduleManager.addModule(BlueSkyModule.getInstance(config), false);

  // await migrateSelectedTables(["BlueSky"]);
  await migrateAllTables();
}

main();
