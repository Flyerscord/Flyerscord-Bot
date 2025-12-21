import { AdminSlashCommand, PARAM_TYPES } from "@common/models/SlashCommand";
import RuleFile from "@modules/rules/utils/RuleFile";
import { Attachment } from "discord.js";
import { ChatInputCommandInteraction } from "discord.js";

export default class UpdateRulesCommand extends AdminSlashCommand {
  constructor() {
    super("rulesupdate", "Update the rules", { ephermal: true });

    this.data
      .addSubcommand((subcommand) => subcommand.setName("get").setDescription("Get the file for the current rules"))
      .addSubcommand((subcommand) =>
        subcommand
          .setName("set")
          .setDescription("Set the rules with the edited file")
          .addAttachmentOption((option) => option.setName("file").setDescription("The file to set the rules with").setRequired(true)),
      );
  }

  async execute(interaction: ChatInputCommandInteraction): Promise<void> {
    if (this.isSubCommand(interaction, "get")) {
      const file = RuleFile.getRulesFile();

      if (!file) {
        await this.replies.reply({ content: "Error getting rules file!" });
        return;
      }

      const markdownLink = "https://support.discord.com/hc/en-us/articles/210298617-Markdown-Text-101-Chat-Formatting-Bold-Italic-Underline";

      await this.replies.reply({
        files: [file],
        content: `Here is the current rules file. Edit it with your text editor and then run \`/rulesupdate set\` to update the rules.\nEach section's header is marked with \`///HEADER_NAME///\`\nYou can manually add message breaks with \`---BREAK---\`\n\nFor more information on how to format your rules, see the [Discord Markdown Guide](${markdownLink}).`,
      });
    } else if (this.isSubCommand(interaction, "set")) {
      const file = this.getParamValue(interaction, PARAM_TYPES.ATTACHMENT, "file") as Attachment;

      if (!file.name.endsWith(".txt")) {
        await this.replies.reply({ content: "Error: File must be a .txt file!" });
        return;
      }

      const res = await RuleFile.setRulesFile(file);
      if (!res) {
        await this.replies.reply({ content: "Error setting rules file!" });
        return;
      }

      await this.replies.reply({ content: "Rules file updated!" });
    } else {
      await this.replies.reply({ content: "Invalid subcommand!" });
    }
  }
}
