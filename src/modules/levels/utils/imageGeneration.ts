import { createCanvas, loadImage, CanvasRenderingContext2D } from "canvas";
import { formatExp, getShortenedMessageCount } from "./leveling";

function drawRoundedRect(ctx: CanvasRenderingContext2D, x: number, y: number, width: number, height: number, radius: number): void {
  ctx.beginPath();
  ctx.moveTo(x + radius, y);
  ctx.arcTo(x + width, y, x + width, y + height, radius);
  ctx.arcTo(x + width, y + height, x, y + height, radius);
  ctx.arcTo(x, y + height, x, y, radius);
  ctx.arcTo(x, y, x + width, y, radius);
  ctx.closePath();
}

export async function createImage(totalMessages: number, currentExp: number, neededExp: number, level: number, username: string): Promise<Buffer> {
  const width = 900;
  const height = 300;

  const canvas = createCanvas(width, height);
  const ctx = canvas.getContext("2d");

  const backgroundImage = await loadImage(`${__dirname}/../assets/background.png`);

  // Add background image
  ctx.drawImage(backgroundImage, 0, 0, width, height);

  // Add background color
  ctx.fillStyle = "#44444499";
  ctx.fillRect(0, 0, width, height);

  // Add border
  ctx.strokeStyle = "#aaaaaa66";
  ctx.lineWidth = 15;
  ctx.strokeRect(0, 0, width, height);

  // Add username
  ctx.fillStyle = "#FFA500";
  ctx.font = "40px Arial";
  ctx.fillText(username, 50, 75);

  // Add total messages
  ctx.fillStyle = "#dddddd";
  ctx.font = "15px Arial";
  ctx.fillText(`Total messages: ${getShortenedMessageCount(totalMessages)}`, 50, 100);

  // Add level word
  ctx.fillStyle = "#000000";
  ctx.font = "20px Arial";
  ctx.fillText("LVL", 670, 110);

  // Add level number
  ctx.fillStyle = "#000000";
  ctx.font = "60px Arial";
  ctx.fillText(`${level}`, 700, 110);

  // Pill border
  ctx.fillStyle = "#aaaaaa";
  drawRoundedRect(ctx, 70, 145, 760, 110, 50);
  ctx.fill();

  // Pill background
  ctx.fillStyle = "#444444";
  drawRoundedRect(ctx, 75, 150, 750, 100, 50);
  ctx.fill();

  const pillWidth = (currentExp / neededExp) * 750;

  // Pill progress
  ctx.fillStyle = "#FFA500";
  drawRoundedRect(ctx, 75, 150, pillWidth, 100, 50);
  ctx.fill();

  // Set exp text
  ctx.fillStyle = "#ffffff";
  ctx.font = "30px Arial";
  ctx.fillText(`${formatExp(currentExp)} exp / ${formatExp(neededExp)} exp`, 100, 210);

  return canvas.toBuffer("image/png");
}
