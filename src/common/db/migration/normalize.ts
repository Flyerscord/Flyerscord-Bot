import Normalize from "../../migration/Normalize";

export default class CommonNormalize extends Normalize {
  constructor() {
    super("common");
  }

  async normalize(): Promise<void> {}

  protected async runValidation(): Promise<boolean> {}
}
