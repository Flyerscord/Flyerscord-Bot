import Database from "@common/providers/Database";
import { IRuleSection } from "../interfaces/IRuleSection";
import Stumper from "stumper";
import IMessageIds from "../interfaces/IMessageIds";

export default class RulesDB extends Database {
  constructor() {
    super({ name: "rules" });
  }

  addSection(id: string, headerMessageId: string, contentMessageId: string, header: string, content: string): void {
    const section: IRuleSection = { headerMessageId: headerMessageId, contentMessageId: contentMessageId, header: header, content: content };
    this.db.set(id, section);
  }

  removeSection(id: string): void {
    this.db.delete(id);
  }

  getSection(id: string): IRuleSection | undefined {
    if (!this.hasSection(id)) {
      return undefined;
    }
    return this.db.get(id);
  }

  hasSection(id: string): boolean {
    return this.db.has(id);
  }

  setSectionHeader(id: string, header: string): void {
    if (!this.hasSection(id)) {
      Stumper.error(`Section ${id} not found!`, "rules:RulesDB:setSectionHeader");
      return;
    }
    this.db.set(id, header, "header");
  }

  setSectionContent(id: string, content: string): void {
    if (!this.hasSection(id)) {
      Stumper.error(`Section ${id} not found!`, "rules:RulesDB:setSectionContent");
      return;
    }
    this.db.set(id, content, "content");
  }

  setSectionHeaderId(id: string, headerId: string): void {
    if (!this.hasSection(id)) {
      Stumper.error(`Section ${id} not found!`, "rules:RulesDB:setSectionHeaderId");
      return;
    }
    this.db.set(id, headerId, "headerMessageId");
  }

  setSectionContentId(id: string, contentId: string): void {
    if (!this.hasSection(id)) {
      Stumper.error(`Section ${id} not found!`, "rules:RulesDB:setSectionContentId");
      return;
    }
    this.db.set(id, contentId, "contentMessageId");
  }

  getAllMessageIds(): IMessageIds[] {
    const messageIds: IMessageIds[] = [];
    const ids = this.getAllKeys();

    for (const id of ids) {
      const section = this.getSection(id as string);
      if (!section) continue;

      messageIds.push({ id: id as string, headerId: section.headerMessageId, contentId: section.contentMessageId });
    }
    return messageIds;
  }

  blankOutAllMessageIds(): void {
    const ids = this.getAllKeys();

    for (const id of ids) {
      this.db.set(id, "", "headerMessageId");
      this.db.set(id, "", "contentMessageId");
    }
    Stumper.warning(`Blanked out all message IDs!`, "rules:RulesDB:blankOutAllMessageIds");
  }
}
