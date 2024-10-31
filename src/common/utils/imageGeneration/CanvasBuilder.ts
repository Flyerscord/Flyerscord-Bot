import { Canvas, createCanvas } from "canvas";

export default class CanvasBuilder {
  private canvas: Canvas;
  private ctx: CanvasRenderingContext2D;

  // Default values
  private readonly defaultFillStyle: string = "#000000";
  private readonly defaultFont: string = "10px Arial";
  private readonly defaultTextAlign: CanvasTextAlign = "left";
  private readonly defaultLineWidth: number = 1;
  private readonly defaultTextBaseline: CanvasTextBaseline = "alphabetic";

  constructor(width: number, height: number) {
    this.canvas = createCanvas(width, height);
    this.ctx = this.canvas.getContext("2d") as unknown as CanvasRenderingContext2D;
  }

  drawImage(image: CanvasImageSource, x: number, y: number): CanvasBuilder;
  drawImage(image: CanvasImageSource, x: number, y: number, width: number, height: number): CanvasBuilder;
  drawImage(
    image: CanvasImageSource,
    sourceX: number,
    sourceY: number,
    sourceWidth: number,
    sourceHeight: number,
    destX: number,
    destY: number,
    destWidth: number,
    destHeight: number,
  ): CanvasBuilder;

  // Implementation for drawImage
  drawImage(
    image: CanvasImageSource,
    x: number,
    y: number,
    width?: number,
    height?: number,
    sourceX?: number,
    sourceY?: number,
    sourceWidth?: number,
    sourceHeight?: number,
  ): CanvasBuilder {
    if (sourceX !== undefined && sourceY !== undefined && sourceWidth !== undefined && sourceHeight !== undefined) {
      // Case for drawImage(image, sourceX, sourceY, sourceWidth, sourceHeight, x, y, width, height)
      this.ctx.drawImage(image, sourceX, sourceY, sourceWidth, sourceHeight, x, y, width!, height!);
    } else if (width !== undefined && height !== undefined) {
      // Case for drawImage(image, x, y, width, height)
      this.ctx.drawImage(image, x, y, width, height);
    } else {
      // Case for drawImage(image, x, y)
      this.ctx.drawImage(image, x, y);
    }
    return this;
  }

  // Overloads for putImageData
  putImageData(imageData: ImageData, x: number, y: number): CanvasBuilder;
  putImageData(imageData: ImageData, x: number, y: number, dirtyX: number, dirtyY: number, dirtyWidth: number, dirtyHeight: number): CanvasBuilder;

  // Implementation for putImageData
  putImageData(
    imageData: ImageData,
    x: number,
    y: number,
    dirtyX?: number,
    dirtyY?: number,
    dirtyWidth?: number,
    dirtyHeight?: number,
  ): CanvasBuilder {
    if (dirtyX !== undefined && dirtyY !== undefined && dirtyWidth !== undefined && dirtyHeight !== undefined) {
      // Case for putImageData(imageData, x, y, dirtyX, dirtyY, dirtyWidth, dirtyHeight)
      this.ctx.putImageData(imageData, x, y, dirtyX, dirtyY, dirtyWidth, dirtyHeight);
    } else {
      // Case for putImageData(imageData, x, y)
      this.ctx.putImageData(imageData, x, y);
    }
    return this;
  }

  save(): CanvasBuilder {
    this.ctx.save();
    return this;
  }

  restore(): CanvasBuilder {
    this.ctx.restore();
    return this;
  }

  rotate(angleRadians: number): CanvasBuilder {
    this.ctx.rotate(angleRadians);
    return this;
  }

  translate(offsetX: number, offsetY: number): CanvasBuilder {
    this.ctx.translate(offsetX, offsetY);
    return this;
  }

  transform(scaleX: number, skewX: number, skewY: number, scaleY: number, translateX: number, translateY: number): CanvasBuilder {
    this.ctx.transform(scaleX, skewX, skewY, scaleY, translateX, translateY);
    return this;
  }

  resetTransform(): CanvasBuilder {
    this.ctx.resetTransform();
    return this;
  }

  setTransform(transformMatrix?: DOMMatrix): CanvasBuilder {
    this.ctx.setTransform(transformMatrix);
    return this;
  }

  scale(scaleX: number, scaleY: number): CanvasBuilder {
    this.ctx.scale(scaleX, scaleY);
    return this;
  }

  clip(fillRule?: CanvasFillRule): CanvasBuilder {
    this.ctx.clip(fillRule);
    return this;
  }

  fill(fillRule?: CanvasFillRule): CanvasBuilder {
    this.ctx.fill(fillRule);
    return this;
  }

  stroke(): CanvasBuilder {
    this.ctx.stroke();
    return this;
  }

  fillText(text: string, x: number, y: number, maxWidth?: number): CanvasBuilder {
    this.ctx.fillText(text, x, y, maxWidth);
    return this;
  }

  strokeText(text: string, x: number, y: number, maxWidth?: number): CanvasBuilder {
    this.ctx.strokeText(text, x, y, maxWidth);
    return this;
  }

  fillRect(x: number, y: number, width: number, height: number): CanvasBuilder {
    this.ctx.fillRect(x, y, width, height);
    return this;
  }

  strokeRect(x: number, y: number, width: number, height: number): CanvasBuilder {
    this.ctx.strokeRect(x, y, width, height);
    return this;
  }

  clearRect(x: number, y: number, width: number, height: number): CanvasBuilder {
    this.ctx.clearRect(x, y, width, height);
    return this;
  }

  rect(x: number, y: number, width: number, height: number): CanvasBuilder {
    this.ctx.rect(x, y, width, height);
    return this;
  }

  roundRect(x: number, y: number, width: number, height: number, radii?: number | number[]): CanvasBuilder {
    this.ctx.roundRect(x, y, width, height, radii);
    return this;
  }

  moveTo(x: number, y: number): CanvasBuilder {
    this.ctx.moveTo(x, y);
    return this;
  }

  lineTo(x: number, y: number): CanvasBuilder {
    this.ctx.lineTo(x, y);
    return this;
  }

  bezierCurveTo(
    controlPoint1X: number,
    controlPoint1Y: number,
    controlPoint2X: number,
    controlPoint2Y: number,
    endX: number,
    endY: number,
  ): CanvasBuilder {
    this.ctx.bezierCurveTo(controlPoint1X, controlPoint1Y, controlPoint2X, controlPoint2Y, endX, endY);
    return this;
  }

  quadraticCurveTo(controlPointX: number, controlPointY: number, endX: number, endY: number): CanvasBuilder {
    this.ctx.quadraticCurveTo(controlPointX, controlPointY, endX, endY);
    return this;
  }

  beginPath(): CanvasBuilder {
    this.ctx.beginPath();
    return this;
  }

  closePath(): CanvasBuilder {
    this.ctx.closePath();
    return this;
  }

  arc(
    centerX: number,
    centerY: number,
    radius: number,
    startAngleRadians: number,
    endAngleRadians: number,
    counterclockwise?: boolean,
  ): CanvasBuilder {
    this.ctx.arc(centerX, centerY, radius, startAngleRadians, endAngleRadians, counterclockwise);
    return this;
  }

  arcTo(startX: number, startY: number, endX: number, endY: number, radius: number): CanvasBuilder {
    this.ctx.arcTo(startX, startY, endX, endY, radius);
    return this;
  }

  ellipse(
    centerX: number,
    centerY: number,
    radiusX: number,
    radiusY: number,
    rotationRadians: number,
    startAngleRadians: number,
    endAngleRadians: number,
    counterclockwise?: boolean,
  ): CanvasBuilder {
    this.ctx.ellipse(centerX, centerY, radiusX, radiusY, rotationRadians, startAngleRadians, endAngleRadians, counterclockwise);
    return this;
  }

  setLineDash(dashSegments: number[]): CanvasBuilder {
    this.ctx.setLineDash(dashSegments);
    return this;
  }

  setImageSmoothingEnabled(enabled: boolean): CanvasBuilder {
    this.ctx.imageSmoothingEnabled = enabled;
    return this;
  }

  setGlobalCompositeOperation(operation: GlobalCompositeOperation): CanvasBuilder {
    this.ctx.globalCompositeOperation = operation;
    return this;
  }

  setGlobalAlpha(alpha: number): CanvasBuilder {
    this.ctx.globalAlpha = alpha;
    return this;
  }

  setShadowColor(color: string): CanvasBuilder {
    this.ctx.shadowColor = color;
    return this;
  }

  setMiterLimit(limit: number): CanvasBuilder {
    this.ctx.miterLimit = limit;
    return this;
  }

  setLineWidth(width: number): CanvasBuilder {
    this.ctx.lineWidth = width;
    return this;
  }

  setLineCap(cap: CanvasLineCap): CanvasBuilder {
    this.ctx.lineCap = cap;
    return this;
  }

  setLineJoin(join: CanvasLineJoin): CanvasBuilder {
    this.ctx.lineJoin = join;
    return this;
  }

  setLineDashOffset(offset: number): CanvasBuilder {
    this.ctx.lineDashOffset = offset;
    return this;
  }

  setShadowOffsetX(offset: number): CanvasBuilder {
    this.ctx.shadowOffsetX = offset;
    return this;
  }

  setShadowOffsetY(offset: number): CanvasBuilder {
    this.ctx.shadowOffsetY = offset;
    return this;
  }

  setShadowBlur(blur: number): CanvasBuilder {
    this.ctx.shadowBlur = blur;
    return this;
  }

  setCurrentTransform(transform: DOMMatrix): CanvasBuilder {
    this.ctx.setTransform(transform);
    return this;
  }

  setFillStyle(style: string | CanvasGradient | CanvasPattern): CanvasBuilder {
    this.ctx.fillStyle = style;
    return this;
  }

  setStrokeStyle(style: string | CanvasGradient | CanvasPattern): CanvasBuilder {
    this.ctx.strokeStyle = style;
    return this;
  }

  setFont(font: string): CanvasBuilder {
    this.ctx.font = font;
    return this;
  }

  setTextBaseline(baseline: CanvasTextBaseline): CanvasBuilder {
    this.ctx.textBaseline = baseline;
    return this;
  }

  setTextAlign(align: CanvasTextAlign): CanvasBuilder {
    this.ctx.textAlign = align;
    return this;
  }

  resetFillStyle(): CanvasBuilder {
    this.ctx.fillStyle = this.defaultFillStyle;
    return this;
  }

  resetFont(): CanvasBuilder {
    this.ctx.font = this.defaultFont;
    return this;
  }

  resetTextAlign(): CanvasBuilder {
    this.ctx.textAlign = this.defaultTextAlign;
    return this;
  }

  resetLineWidth(): CanvasBuilder {
    this.ctx.lineWidth = this.defaultLineWidth;
    return this;
  }

  resetTextBaseline(): CanvasBuilder {
    this.ctx.textBaseline = this.defaultTextBaseline;
    return this;
  }

  exportToBuffer(): Buffer {
    return this.canvas.toBuffer("image/png");
  }
}
