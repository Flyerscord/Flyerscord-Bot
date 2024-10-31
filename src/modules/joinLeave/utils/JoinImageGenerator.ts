import ImageGenerator from "../../../common/utils/imageGeneration/ImageGenerator";

export default class JoinImageGenerator extends ImageGenerator {
  private readonly username: string;
  private readonly profilePictureUrl: string;
  private readonly memberNumber: number;

  constructor(username: string, profilePictureUrl: string, memberNumber: number) {
    super(900, 450);
    this.username = username;
    this.profilePictureUrl = profilePictureUrl;
    this.memberNumber = memberNumber;
  }

  protected override async createImage(): Promise<void> {
    this.roundCornersOfCanvas(15);

    const backgroundImage = await this.loadImage(`${__dirname}/../assets/background.png`);

    // Add background image
    this.builder.drawImage(backgroundImage, 0, 0, this.width, this.height);

    // Add background color
    this.builder.setFillStyle("#44444499").fillRect(0, 0, this.width, this.height);

    // Add border
    this.builder.setStrokeStyle("#aaaaaa66").setLineWidth(15).strokeRect(0, 0, this.width, this.height);

    // Add username text
    const usernameX = this.centerX;
    const usernameY = 75;
    const usernameText = `Welcome ${this.username}!`;
    this.builder
      .setFillStyle("#F74902")
      .setStrokeStyle("#000000")
      .setLineWidth(5)
      .setFont("bold 60px Arial")
      .setTextAlign("center")
      .setTextBaseline("middle")
      .strokeText(usernameText, usernameX, usernameY)
      .fillText(usernameText, usernameX, usernameY);

    // Add member number text
    const memberNumberX = this.centerX;
    const memberNumberY = 365;
    this.builder
      .setFillStyle("#000000")
      .setStrokeStyle("#FFFFFF")
      .setLineWidth(5)
      .setFont("italic bold 35px Arial")
      .setTextAlign("center")
      .setTextBaseline("middle")
      .strokeText(`Member #${this.memberNumber}`, memberNumberX, memberNumberY)
      .fillText(`Member #${this.memberNumber}`, memberNumberX, memberNumberY);

    // Add photo circle
    const profilePicture = await this.loadImage(this.profilePictureUrl);
    this.drawPhotoCircle(profilePicture, this.centerX, this.centerY, 92, 2);
  }
}
