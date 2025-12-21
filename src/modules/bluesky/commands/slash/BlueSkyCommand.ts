import { AutocompleteInteraction, ChatInputCommandInteraction } from "discord.js";
import { AdminAutocompleteSlashCommand, PARAM_TYPES } from "@common/models/SlashCommand";
import { AccountAlreadyExistsException } from "../../exceptions/AccountAlreadyExistsException";
import { AccountDoesNotExistException } from "../../exceptions/AccountDoesNotExistException";
import Stumper from "stumper";
import BlueSky from "../../utils/BlueSky";
import BlueSkyDB, { BlueSkyActionType } from "../../db/BlueSkyDB";

export default class BlueSkyCommand extends AdminAutocompleteSlashCommand {
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
    const db = new BlueSkyDB();
    const bk = BlueSky.getInstance();

    if (this.isSubCommand(interaction, "add")) {
      const account: string = this.getParamValue(interaction, PARAM_TYPES.STRING, "account");
      try {
        await bk.addAccountToList(account);
        await db.addAuditLog(BlueSkyActionType.ADD, interaction.user.id, { account: account });
        await this.replies.reply(`Account ${account} added!`);
        Stumper.info(`Account ${account} added to watched accounts`, "blueSky:BlueSkyCommand:add");
      } catch (error) {
        if (error instanceof AccountAlreadyExistsException) {
          await this.replies.reply({ content: `Account ${account} already exists!`, ephemeral: true });
        } else {
          await this.replies.reply({ content: "Error adding account!", ephemeral: true });
        }
      }
    } else if (this.isSubCommand(interaction, "remove")) {
      const account: string = this.getParamValue(interaction, PARAM_TYPES.STRING, "account");
      try {
        await bk.removeAccountFromList(account);
        await db.addAuditLog(BlueSkyActionType.REMOVE, interaction.user.id, { account: account });
        await this.replies.reply(`Account ${account} removed!`);
        Stumper.info(`Account ${account} removed from watched accounts`, "blueSky:BlueSkyCommand:remove");
      } catch (error) {
        if (error instanceof AccountDoesNotExistException) {
          await this.replies.reply({ content: `Account ${account} does not exist!`, ephemeral: true });
        } else {
          await this.replies.reply({ content: "Error removing account!", ephemeral: true });
        }
      }
    } else if (this.isSubCommand(interaction, "list")) {
      const accounts = await bk.getListAccounts();
      if (accounts.length == 0) {
        await this.replies.reply("No accounts found!");
      } else {
        const names = accounts.map((ele) => ele.userHandle).join("\n");
        const message = `Current Accounts:\n\`\`\`\n${names}\n\`\`\``;

        await this.replies.reply(message);
      }
    } else {
      await this.replies.reply({ content: "Invalid subcommand!", ephemeral: true });
    }
  }

  async getAutoCompleteOptions(interaction: AutocompleteInteraction): Promise<string[] | undefined> {
    const subCommand = this.getSubCommand(interaction);
    if (subCommand !== "remove") {
      return undefined;
    }

    const focusedOptionName = this.getFocusedOptionName(interaction);
    if (focusedOptionName == "account") {
      const bk = BlueSky.getInstance();
      try {
        const accounts = await bk.getListAccounts();

        return accounts.map((ele) => ele.userHandle);
      } catch {
        return undefined;
      }
    }
    return undefined;
  }
}
