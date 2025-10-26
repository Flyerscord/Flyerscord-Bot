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
import UserManagementModule from "@root/src/modules/userManagement/UserManagementModule";

import BlueSkyNormalize from "@root/src/modules/bluesky/migration/normalize";
import DaysUntilNormalize from "@root/src/modules/daysUntil/migration/normalize";
import GameDayPostsNormalize from "@root/src/modules/gamedayPosts/migration/normalize";
import LevelsNormalize from "@root/src/modules/levels/migration/normalize";
import PinsNormalize from "@root/src/modules/pins/migration/normalize";
import PlayerEmojisNormalize from "@root/src/modules/playerEmojis/migration/normalize";
import ReactionRoleNormalize from "@root/src/modules/reactionRole/migration/normalize";
import RulesNormalize from "@root/src/modules/rules/migration/normalize";
import VisitorRoleNormalize from "@root/src/modules/visitorRole/migration/normalize";

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
    await normalize.normalize();
    const result = await normalize.validate();
    if (!result) {
      errorCount++;
    }
  }

  if (errorCount > 0) {
    Stumper.error(`Normalization failed for ${errorCount} tables`, "Migration:Normalize");
    process.exit(1);
  }

  Stumper.info("Normalization completed successfully", "Migration:Normalize");
  process.exit(0);
}

main();
