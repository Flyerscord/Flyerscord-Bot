import Database from "@common/providers/Database";
import Stumper from "stumper";
import ConfigManager from "@common/config/ConfigManager";
import { IRuleSection, IRuleSectionPage } from "../interfaces/IRuleSection";

export default class RulesDB extends Database {
  private readonly fullFileKey = "full_file";

  constructor() {
    super({ name: "ruleSections" });

    const sections = ConfigManager.getInstance().getConfig("Rules").sections;
    for (const section of sections) {
      const sectionInfo: IRuleSection = {
        name: section,
        headerUrl: `# ${section}`,
        headerMessageId: "",
        contentPages: [],
      };
      this.ensure(this.getSectionId(section), sectionInfo);
    }

    this.ensure(this.fullFileKey, "");
  }

  getSection(section: string): IRuleSection {
    return this.db.get(this.getSectionId(section));
  }

  getAllSections(): IRuleSection[] {
    return this.getAllValues();
  }

  getSectionHeader(section: string): string {
    return this.db.get(this.getSectionId(section), "headerUrl");
  }

  hasSection(section: string): boolean {
    return this.db.has(this.getSectionId(section));
  }

  setHeaderUrl(section: string, headerUrl: string): boolean {
    if (!this.hasSection(section)) {
      Stumper.error(`Section ${section} does not exist!`, "rules:RulesDB:setHeaderUrl");
      return false;
    }
    this.db.set(this.getSectionId(section), headerUrl, "headerUrl");
    return true;
  }

  setHeaderMessageId(section: string, headerMessageId: string): boolean {
    if (!this.hasSection(section)) {
      Stumper.error(`Section ${section} does not exist!`, "rules:RulesDB:setHeaderMessageId");
      return false;
    }
    this.db.set(this.getSectionId(section), headerMessageId, "headerMessageId");
    return true;
  }

  setContentPages(section: string, contentPages: IRuleSectionPage[]): boolean {
    if (!this.hasSection(section)) {
      Stumper.error(`Section ${section} does not exist!`, "rules:RulesDB:setContentPages");
      return false;
    }
    this.db.set(this.getSectionId(section), contentPages, "contentPages");
    return true;
  }

  setContentPageMessageId(section: string, index: number, messageId: string): boolean {
    const id = this.getSectionId(section);

    if (!this.hasSection(id)) {
      Stumper.error(`Section ${section} does not exist!`, "rules:RulesDB:setContentPageMessageId");
      return false;
    }
    const contentPages = this.db.get(id, "contentPages");
    contentPages[index].messageId = messageId;
    this.db.set(id, contentPages, "contentPages");
    return true;
  }

  getSectionId(name: string): string {
    return name.toLowerCase().replaceAll(" ", "_");
  }

  setFullFile(fullFile: string): void {
    this.db.set(this.fullFileKey, fullFile);
  }

  getFullFile(): string {
    return this.db.get(this.fullFileKey);
  }
}
