import ImageGenerator from "../../../common/utils/imageGeneration/ImageGenerator";

export default class RankImageGenerator extends ImageGenerator {
  private readonly messages: number;
  private readonly curExp: number;
  private readonly neededExp: number;
  private readonly level: number;
  private readonly rank: number;
  private readonly username: string;
  private readonly profilePictureUrl: string;

  constructor(messages: number, curExp: number, neededExp: number, level: number, rank: number, username: string, profilePictureUrl: string) {
    super(900, 300);
    this.messages = messages;
    this.curExp = curExp;
    this.neededExp = neededExp;
    this.level = level;
    this.rank = rank;
    this.username = username;
    this.profilePictureUrl = profilePictureUrl;
  }

  protected override async createImage(): Promise<void> {
    this.roundCornersOfCanvas(15);

    const backgroundImage = await this.loadImage(`${__dirname}/../assets/background.png`);

    // Add background image
    this.builder.drawImage(backgroundImage, 0, 0, this.width, this.height);

    // Add background color
    this.builder.setFillStyle("#444444dd").fillRect(0, 0, this.width, this.height);

    // Add border
    this.builder.setStrokeStyle("#aaaaaa66").setLineWidth(15).strokeRect(0, 0, this.width, this.height);

    // Add username text
    this.builder.setFillStyle("#FFFFFF").setFont("36px Arial").fillText(this.username, 235, 215);

    // Add total messages
    this.builder
      .setFillStyle("#aaaaaa")
      .setFont("15px Arial")
      .fillText(`Messages: ${this.getShortenedMessageCount(this.messages)}`, 25, 35);

    // Rank
    let rankNumX = 710;
    let rankNumY = 150;
    let rankNumSize = 150;

    if (this.level > 99) {
      rankNumX = 520;
    } else if (this.level > 9) {
      rankNumX = 610;
    }

    let rankTextX = rankNumX - 130;
    let rankTextY = rankNumY;

    if (this.rank > 999) {
      rankTextX = rankNumX - 295;
      rankNumSize = 100;
    } else if (this.rank > 99) {
      rankTextX = rankNumX - 280;
      rankNumSize = 125;
    } else if (this.rank > 9) {
      rankTextX = rankNumX - 230;
    }

    // Add rank #
    this.builder.setFillStyle("#000000").setFont("50px Arial").fillText("#", rankTextX, rankTextY);

    // Add rank number
    this.builder.setFillStyle("#000000").setFont(`${rankNumSize}px Arial`).setTextAlign("right").fillText(`${this.rank}`, rankNumX, rankNumY);
    this.builder.resetTextAlign();

    // Level
    const levelX = 850;
    const levelY = 150;

    let levelWordX = levelX - 140;
    let levelWordY = levelY;
    if (this.level > 99) {
      levelWordX = levelX - 330;
    } else if (this.level > 9) {
      levelWordX = levelX - 235;
    }

    // Add level word
    this.builder.setFillStyle("#b3b3b3").setFont("30px Arial").fillText("LVL", levelWordX, levelWordY);

    // Add level number
    this.builder.setFillStyle("#b3b3b3").setFont("150px Arial").setTextAlign("right").fillText(`${this.level}`, levelX, levelY);
    this.builder.resetTextAlign();

    // Set Exp text
    this.builder.setFillStyle("#ffffff").setFont("20px Arial").setTextAlign("right").fillText(`${this.curExp} exp / ${this.neededExp} exp`, 840, 215);
    this.builder.resetTextAlign();

    // Exp Pill
    const pillWidth = 640;
    const pillHeight = 30;
    const pillX = 220;
    const pillY = 230;
    const pillRadius = pillHeight / 2;

    const pillGap = 3;

    // Pill border
    this.drawRoundedRect(pillX - pillGap, pillY - pillGap, pillWidth + pillGap * 2, pillHeight + pillGap * 2, pillRadius);
    this.builder.fill();

    // Pill background
    this.builder.setFillStyle("#444444");
    this.drawRoundedRect(pillX, pillY, pillWidth, pillHeight, pillRadius);
    this.builder.fill();

    const pillFilledWidth = (this.curExp / this.neededExp) * pillWidth;

    // Pill progress
    this.builder.setFillStyle("#FFA500");
    this.drawRoundedRect(pillX, pillY, pillFilledWidth, pillHeight, pillRadius);
    this.builder.fill();

    // Photo Circle
    const photoX = 125;
    const photoY = this.centerY;

    // Add border for photo
    const outerRadius = 92;
    this.builder
      .setFillStyle("#000000")
      .beginPath()
      .arc(photoX, photoY, outerRadius, 0, 2 * Math.PI)
      .closePath()
      .fill();

    // Add circle for photo
    const innerRadius = 90;
    const profilePicture = await this.loadImage(this.profilePictureUrl);
    this.builder
      .beginPath()
      .arc(photoX, photoY, innerRadius, 0, 2 * Math.PI)
      .closePath()
      .clip()
      .drawImage(profilePicture, photoX - innerRadius, photoY - innerRadius, innerRadius * 2, innerRadius * 2);
  }

  private getShortenedMessageCount(messageCount: number): string {
    if (messageCount < 1000) {
      return messageCount.toString();
    } else if (messageCount < 1000000) {
      const wholeNumber = Math.floor(messageCount / 1000);
      const remainder = messageCount % 1000;
      return `${wholeNumber}.${remainder.toString().slice(0, 2)}K`;
    } else {
      const wholeNumber = Math.floor(messageCount / 1000000);
      const remainder = messageCount % 1000000;
      return `${wholeNumber}.${remainder.toString().slice(0, 2)}M`;
    }
  }
}
