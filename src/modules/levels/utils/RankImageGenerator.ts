import ImageGenerator from "../../../common/utils/imageGeneration/ImageGenerator";

export default class RankImageGenerator extends ImageGenerator {
  constructor() {
    super(900, 300);
  }

  protected override async createImage(): Promise<void> {}
}
