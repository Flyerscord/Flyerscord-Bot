import Mee6LevelsApi, { User } from "mee6-levels-api";
import Stumper from "stumper";

import { AdminSlashCommand, PARAM_TYPES } from "../../../models/SlashCommand";
import { ChatInputCommandInteraction } from "discord.js";
import LevelsDB from "../../../providers/Levels.Database";

export default class ImportMee6Command extends AdminSlashCommand {
  constructor() {
    super("importmee6", "Import levels from mee6. Will wipe out all of the previous levels.");

    this.data.addStringOption((option) =>
      option
        .setName("confirm")
        .setDescription("Confirm this is actually something that you want to do. The value must be CONFIRM.")
        .setRequired(true),
    );
  }

  async execute(interaction: ChatInputCommandInteraction): Promise<void> {
    const confirmation: string = this.getParamValue(interaction, PARAM_TYPES.STRING, "confirm");

    // Check if the user is flyerzrule
    if (interaction.user.id == "140656762960347136") {
      if (confirmation == "CONFIRM") {
        Stumper.warning("Importing levels from Mee6 all previous levels will be wiped!", "ImportMee6Command");

        const db = LevelsDB.getInstance();
        db.wipe();

        if (interaction.guildId) {
          const users: Array<User> = await Mee6LevelsApi.getLeaderboard(interaction.guildId);

          for (let i = 0; i < users.length; i++) {
            const user = users[i];
            const userLevel = db.addNewUser(user.id);
            userLevel.currentLevel = user.level;
            userLevel.messageCount = user.messageCount;
            userLevel.totalExp = user.xp.totalXp;
            db.updateUser(user.id, userLevel);
          }
        }
      }
    } else {
      Stumper.warning(`User ${interaction.user.username} attempted to import mee6 levels!`, "ImportMee6Command");
      interaction.reply({ ephemeral: true, content: "Only flyerzrule can run this command!" });
    }
  }
}
