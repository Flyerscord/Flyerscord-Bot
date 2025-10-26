import Normalize from "@root/src/common/migration/Normalize";

// TODO: Add rules normalization ( Going to be a major overhaul )
export default class RulesNormalize extends Normalize {
  constructor() {
    super("Rules");
  }

  async normalize(): Promise<void> {}

  protected async runValidation(): Promise<boolean> {
    return false;
  }

  private async migrateRules(): Promise<number> {
    return 0;
  }
}
