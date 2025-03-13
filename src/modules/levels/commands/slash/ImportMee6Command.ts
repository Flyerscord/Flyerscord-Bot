import Mee6LevelsApi, { User } from "mee6-levels-api";
import Stumper from "stumper";

import { ChatInputCommandInteraction } from "discord.js";
import { AdminSlashCommand, PARAM_TYPES } from "../../../../common/models/SlashCommand";
import LevelsDB from "../../providers/Levels.Database";
import CommonModule from "../../../../common/CommonModule";

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
    await interaction.deferReply({ ephemeral: true });

    const confirmation: string = this.getParamValue(interaction, PARAM_TYPES.STRING, "confirm");

    // Check if the user is flyerzrule
    if (interaction.user.id == "140656762960347136") {
      if (confirmation == "CONFIRM") {
        Stumper.warning("Importing levels from Mee6 all previous levels will be wiped!", "levels:ImportMee6Command:execute");

        const db = LevelsDB.getInstance();
        db.wipe();

        const guildId = CommonModule.getInstance().config.masterGuildId;
        if (guildId) {
          const users: User[] = await Mee6LevelsApi.getLeaderboard(guildId);
          Stumper.debug(`Retrieved ${users.length} from mee6 leaderboards`, "levels:ImportMee6Command:execute");

          for (let i = 0; i < users.length; i++) {
            const user = users[i];
            const userLevel = db.addNewUser(user.id);
            userLevel.currentLevel = user.level;
            userLevel.messageCount = user.messageCount;
            userLevel.totalExp = user.xp.totalXp;
            db.updateUser(user.id, userLevel);
          }
          interaction.editReply({ content: "Successfully imported levels!" });
          return;
        }
      } else {
        interaction.editReply({ content: "Failed to confirm import!" });
        return;
      }
    } else {
      Stumper.warning(`User ${interaction.user.username} attempted to import mee6 levels!`, "levels:ImportMee6Command:execute");
      interaction.editReply({ content: "Only flyerzrule can run this command!" });
      return;
    }
    interaction.editReply({ content: "Error importing levels!" });
  }
}
