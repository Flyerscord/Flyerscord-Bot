import Database from "@common/providers/Database";
import { IRuleSection } from "../interfaces/IRuleSection";

export default class RulesDB extends Database {
  constructor() {
    super({ name: "rules" });
  }

  addSection(name: string, headerMessageId: string, contentMessageId: string): void {
    const section: IRuleSection = { headerMessageId: headerMessageId, contentMessageId: contentMessageId };
    this.db.set(name, section);
  }

  removeSection(name: string): void {
    this.db.delete(name);
  }

  getSection(name: string): IRuleSection | undefined {
    if (!this.hasSection(name)) {
      return undefined;
    }
    return this.db.get(name);
  }

  hasSection(name: string): boolean {
    return this.db.has(name);
  }
}
