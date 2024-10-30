import { createCanvas, loadImage } from "canvas";

export async function createImage(username: string, profilePictureUrl: string, memberNumber: number): Promise<Buffer> {
  const width = 900;
  const height = 450;
  const cornerRadius = 15;

  const centerX = width / 2;
  const centerY = height / 2;

  // Create a canvas and get its context
  const canvas = createCanvas(width, height);
  const ctx = canvas.getContext("2d");

  // Round the corners of the canvas
  ctx.beginPath();
  ctx.moveTo(cornerRadius, 0);
  ctx.lineTo(width - cornerRadius, 0);
  ctx.quadraticCurveTo(width, 0, width, cornerRadius);
  ctx.lineTo(width, height - cornerRadius);
  ctx.quadraticCurveTo(width, height, width - cornerRadius, height);
  ctx.lineTo(cornerRadius, height);
  ctx.quadraticCurveTo(0, height, 0, height - cornerRadius);
  ctx.lineTo(0, cornerRadius);
  ctx.quadraticCurveTo(0, 0, cornerRadius, 0);
  ctx.closePath();
  ctx.clip();

  // Add background image
  const backgroundImage = await loadImage(`${__dirname}/../assets/background.png`);
  ctx.drawImage(backgroundImage, 0, 0, width, height);

  // Add background color
  ctx.fillStyle = "#44444499";
  ctx.fillRect(0, 0, width, height);

  // Add border
  ctx.strokeStyle = "#aaaaaa66";
  ctx.lineWidth = 15;
  ctx.strokeRect(0, 0, width, height);

  // Add username text
  const usernameX = centerX;
  const usernameY = 75;
  const usernameText = `Welcome ${username}!`;
  ctx.fillStyle = "#F74902";
  ctx.strokeStyle = "#000000";
  ctx.lineWidth = 5;
  ctx.font = "bold 60px Arial";
  ctx.textAlign = "center";
  ctx.textBaseline = "middle";
  ctx.strokeText(usernameText, usernameX, usernameY);
  ctx.fillText(usernameText, usernameX, usernameY);

  // Add member number text
  const memberNumberX = centerX;
  const memberNumberY = 365;
  ctx.fillStyle = "#000000";
  ctx.strokeStyle = "#FFFFFF";
  ctx.lineWidth = 5;
  ctx.font = "italic bold 35px Arial";
  ctx.textAlign = "center";
  ctx.textBaseline = "middle";
  ctx.strokeText(`Member #${memberNumber}`, memberNumberX, memberNumberY);
  ctx.fillText(`Member #${memberNumber}`, memberNumberX, memberNumberY);

  // Add border for photo
  const outerRadius = 92;
  ctx.fillStyle = "#FFFFFF";
  ctx.beginPath();
  ctx.arc(centerX, centerY, outerRadius, 0, 2 * Math.PI);
  ctx.closePath();
  ctx.fill();

  // Add circle for photo
  const innerRadius = 90;
  const profilePicture = await loadImage(profilePictureUrl);
  ctx.beginPath();
  ctx.arc(centerX, centerY, innerRadius, 0, 2 * Math.PI);
  ctx.closePath();
  ctx.clip();
  ctx.drawImage(profilePicture, centerX - innerRadius, centerY - innerRadius, innerRadius * 2, innerRadius * 2);

  return canvas.toBuffer("image/png");
}
