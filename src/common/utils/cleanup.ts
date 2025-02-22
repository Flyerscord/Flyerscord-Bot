import AccountHistoryDB from "../../modules/bluesky/providers/AccountHistory.Database";
import BlueSkyDB from "../../modules/bluesky/providers/BlueSky.Database";
import CustomCommandsDB from "../../modules/customCommands/providers/CustomCommands.Database";
import DaysUntilDB from "../../modules/daysUntil/providers/DaysUtil.Database";
import GameDayPostsDB from "../../modules/gamedayPosts/providers/GameDayPosts.Database";
import LevelExpDB from "../../modules/levels/providers/LevelExp.Database";
import LevelsDB from "../../modules/levels/providers/Levels.Database";
import PlayerEmojisDB from "../../modules/playerEmojis/providers/PlayerEmojis.Database";
import UserManagementDB from "../../modules/userManagement/providers/UserManagement.Database";
import GlobalDB from "../providers/Global.Database";

export function closeAllDbConnections(): void {
  const globalDb = GlobalDB.getInstance();
  const customCommandsDB = CustomCommandsDB.getInstance();
  const daysUntilDB = DaysUntilDB.getInstance();
  const gameDayPostsDB = GameDayPostsDB.getInstance();
  const levelExpDB = LevelExpDB.getInstance();
  const levelsDB = LevelsDB.getInstance();
  const playerEmojisDB = PlayerEmojisDB.getInstance();
  const userManagementDB = UserManagementDB.getInstance();
  const accountHistoryDB = AccountHistoryDB.getInstance();
  const blueSkyDB = BlueSkyDB.getInstance();

  globalDb.close();
  customCommandsDB.close();
  daysUntilDB.close();
  gameDayPostsDB.close();
  levelExpDB.close();
  levelsDB.close();
  playerEmojisDB.close();
  userManagementDB.close();
  accountHistoryDB.close();
  blueSkyDB.close();
}
