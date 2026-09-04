import sharp from "sharp";
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const svgPath = path.resolve(__dirname, "../public/icons/icon.svg");
const outputDir = path.resolve(__dirname, "../public/icons");

if (!fs.existsSync(outputDir)) {
  fs.mkdirSync(outputDir, { recursive: true });
}

async function generate() {
  const svgBuffer = fs.readFileSync(svgPath);

  // 192x192
  await sharp(svgBuffer)
    .resize(192, 192)
    .png()
    .toFile(path.join(outputDir, "icon-192x192.png"));
  console.log("Generated icon-192x192.png");

  // 512x512
  await sharp(svgBuffer)
    .resize(512, 512)
    .png()
    .toFile(path.join(outputDir, "icon-512x512.png"));
  console.log("Generated icon-512x512.png");

  // apple-touch-icon (180x180)
  await sharp(svgBuffer)
    .resize(180, 180)
    .png()
    .toFile(path.resolve(__dirname, "../public/apple-touch-icon.png"));
  console.log("Generated apple-touch-icon.png");

  // favicon (64x64)
  await sharp(svgBuffer)
    .resize(64, 64)
    .png()
    .toFile(path.resolve(__dirname, "../public/favicon.png"));
  console.log("Generated favicon.png");
}

generate().catch((err) => {
  console.error("Error generating icons:", err);
  process.exit(1);
});
