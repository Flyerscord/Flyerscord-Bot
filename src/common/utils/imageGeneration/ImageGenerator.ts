import { loadImage } from "canvas";
import CanvasBuilder from "./CanvasBuilder";
import axios from "axios";
import Stumper from "stumper";
import sharp from "sharp";

export default abstract class ImageGenerator {
  protected builder: CanvasBuilder;

  protected readonly width: number;
  protected readonly height: number;

  protected readonly centerX: number;
  protected readonly centerY: number;

  constructor(width: number, height: number) {
    this.width = width;
    this.height = height;

    this.centerX = width / 2;
    this.centerY = height / 2;

    this.builder = new CanvasBuilder(width, height);
  }

  protected async createImage(): Promise<void> {
    throw new Error("Not Implemented");
  }

  async getImage(): Promise<Buffer> {
    try {
      await this.createImage();
    } catch (error) {
      throw error;
    }
    return this.builder.exportToBuffer();
  }

  protected drawRoundedRect(x: number, y: number, width: number, height: number, radius: number): void {
    this.builder
      .beginPath()
      .moveTo(x + radius, y)
      .arcTo(x + width, y, x + width, y + height, radius)
      .arcTo(x + width, y + height, x, y + height, radius)
      .arcTo(x, y + height, x, y, radius)
      .arcTo(x, y, x + width, y, radius)
      .closePath();
  }

  protected roundCornersOfCanvas(cornerRadius: number): void {
    this.builder
      .beginPath()
      .moveTo(cornerRadius, 0)
      .lineTo(this.width - cornerRadius, 0)
      .quadraticCurveTo(this.width, 0, this.width, cornerRadius)
      .lineTo(this.width, this.height - cornerRadius)
      .quadraticCurveTo(this.width, this.height, this.width - cornerRadius, this.height)
      .lineTo(cornerRadius, this.height)
      .quadraticCurveTo(0, this.height, 0, this.height - cornerRadius)
      .lineTo(0, cornerRadius)
      .quadraticCurveTo(0, 0, cornerRadius, 0)
      .closePath()
      .clip();
  }

  protected drawPhotoCircle(photo: CanvasImageSource, x: number, y: number, radius: number, borderWidth: number): void {
    const innerRadius = radius - borderWidth;
    const outerRadius = radius;

    // Border
    if (borderWidth > 0) {
      this.builder
        .setFillStyle("#000000")
        .beginPath()
        .arc(x, y, outerRadius, 0, 2 * Math.PI)
        .closePath()
        .fill();
    }

    // Circle with photo
    this.builder
      .beginPath()
      .arc(x, y, innerRadius, 0, 2 * Math.PI)
      .closePath()
      .clip()
      .drawImage(photo, x - innerRadius, y - innerRadius, innerRadius * 2, innerRadius * 2);
  }

  protected async loadImage(path: string): Promise<CanvasImageSource> {
    if (path.startsWith("http") && path.endsWith(".webp")) {
      const response = await axios.get(path, { responseType: "arraybuffer" });
      if (response.status !== 200) {
        Stumper.error(`Error downloading image: ${path}`, "common:ImageGenerator:loadImage");
        throw new Error("Error downloading image");
      }

      const webpBuffer = Buffer.from(response.data);
      const pngBuffer = await sharp(webpBuffer).png().toBuffer();
      return this.loadImageSource(pngBuffer);
    }
    return this.loadImageSource(path);
  }

  private async loadImageSource(path: string | Buffer): Promise<CanvasImageSource> {
    const image = await loadImage(path);
    return image as unknown as CanvasImageSource;
  }

  protected createBasicText(text: string, x: number, y: number, font: string, color: string): void {
    this.builder.setFillStyle(color).setFont(font).fillText(text, x, y);
  }
}
