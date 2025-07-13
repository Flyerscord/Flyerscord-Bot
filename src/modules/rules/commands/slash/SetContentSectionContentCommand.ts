import ConfigManager from "@common/config/ConfigManager";
import { AdminAutocompleteSlashCommand, PARAM_TYPES } from "@common/models/SlashCommand";
import RulesDB from "@modules/rules/providers/Rules.Database";
import { createRuleSections, getSectionId } from "@modules/rules/utils/utils";
import { AutocompleteInteraction, ChatInputCommandInteraction } from "discord.js";
import RuleSectionContentModal from "../modal/RuleSectionContentModal";

export default class SetContentSectionContentCommand extends AdminAutocompleteSlashCommand {
  constructor() {
    super("rulessetcontent", "Set the content message for a rule section", { ephermal: true, deferReply: false });

    this.data.addStringOption((option) =>
      option.setName("name").setDescription("The name of the rule section").setRequired(true).setAutocomplete(true),
    );
  }

  async execute(interaction: ChatInputCommandInteraction): Promise<void> {
    const name: string = this.getParamValue(interaction, PARAM_TYPES.STRING, "name");
    const id = getSectionId(name);

    const db = RulesDB.getInstance();
    let section = db.getSection(id);
    const config = ConfigManager.getInstance().getConfig("Rules");
    const sectionNames = config.sections;

    if (!section) {
      if (!sectionNames.includes(name)) {
        await this.replies.reply({ content: "Error finding section!" });
        return;
      }
      await createRuleSections(true);
      section = db.getSection(id)!;
    }

    const contentModal = new RuleSectionContentModal(id);

    await interaction.showModal(contentModal.getModal());
  }

  async getAutoCompleteOptions(interaction: AutocompleteInteraction): Promise<string[] | undefined> {
    const focusedName = this.getFocusedOptionName(interaction);

    if (focusedName == "name") {
      const config = ConfigManager.getInstance().getConfig("Rules");
      return config.sections;
    }
    return undefined;
  }
}
