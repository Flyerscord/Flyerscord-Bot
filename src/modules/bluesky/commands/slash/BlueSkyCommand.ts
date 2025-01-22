import { ChatInputCommandInteraction } from "discord.js";
import { AdminSlashCommand, PARAM_TYPES } from "../../../../common/models/SlashCommand";
import BlueSkyDB from "../../providers/BlueSky.Database";
import { AccountAlreadyExistsException } from "../../exceptions/AccountAlreadyExistsException";
import { AccountDoesNotExistException } from "../../exceptions/AccountDoesNotExistException";
import Stumper from "stumper";

export default class BlueSkyCommand extends AdminSlashCommand {
  constructor() {
    super("bluesky", "Command for managing the BlueSky followed accounts");

    this.data
      .addSubcommand((subcommand) =>
        subcommand
          .setName("add")
          .setDescription("Add a BlueSky account")
          .addStringOption((option) => option.setName("account").setDescription("The BlueSky account to add").setRequired(true)),
      )
      .addSubcommand((subcommand) =>
        subcommand
          .setName("remove")
          .setDescription("Remove a BlueSky account")
          .addStringOption((option) =>
            option.setName("account").setDescription("The BlueSky account to remove").setRequired(true).setAutocomplete(true),
          ),
      )
      .addSubcommand((subcommand) => subcommand.setName("list").setDescription("List all BlueSky accounts"));
  }

  async execute(interaction: ChatInputCommandInteraction): Promise<void> {
    await interaction.deferReply();

    const db = BlueSkyDB.getInstance();

    if (this.isSubCommand(interaction, "add")) {
      const account: string = this.getParamValue(interaction, PARAM_TYPES.STRING, "account");
      try {
        db.addAccount(account, interaction.user.id);
        interaction.editReply({
          content: `Account ${account} added!`,
        });
        Stumper.info(`Account ${account} added to watched accounts`, "blueSky:BlueSkyCommand:add");
      } catch (error) {
        if (error instanceof AccountAlreadyExistsException) {
          interaction.followUp({
            content: `Account ${account} already exists!`,
            ephemeral: true,
          });
        } else {
          interaction.followUp({
            content: "Error adding account!",
            ephemeral: true,
          });
        }
      }
    } else if (this.isSubCommand(interaction, "remove")) {
      const account: string = this.getParamValue(interaction, PARAM_TYPES.STRING, "account");
      try {
        db.removeAccount(account);
        interaction.editReply({
          content: `Account ${account} removed!`,
        });
        Stumper.info(`Account ${account} removed from watched accounts`, "blueSky:BlueSkyCommand:remove");
      } catch (error) {
        if (error instanceof AccountDoesNotExistException) {
          interaction.followUp({
            content: `Account ${account} does not exist!`,
            ephemeral: true,
          });
        } else {
          interaction.followUp({
            content: "Error removing account!",
            ephemeral: true,
          });
        }
      }
    } else if (this.isSubCommand(interaction, "list")) {
      const accounts = db.getAllAccounts();
      if (accounts.length == 0) {
        interaction.editReply({
          content: "No accounts found!",
        });
      } else {
        const names = accounts.join("\n");
        const message = `Current Accounts:\n\`\`\`\n${names}\n\`\`\``;

        interaction.editReply({
          content: message,
        });
      }
    } else {
      interaction.followUp({
        content: "Invalid subcommand!",
        ephemeral: true,
      });
    }
  }
}
