import Database from "@common/providers/Database";
import { IRuleSection } from "../interfaces/IRuleSection";
import Stumper from "stumper";

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
}
