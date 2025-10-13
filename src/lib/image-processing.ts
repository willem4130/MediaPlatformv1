import sharp from "sharp";
import { getOrientation } from "./utils";

export interface ImageMetadata {
  width: number;
  height: number;
  aspectRatio: number;
  orientation: "LANDSCAPE" | "PORTRAIT" | "SQUARE";
  fileSize: number;
  mimeType: string;
}

export async function extractImageMetadata(filepath: string, fileSize: number, mimeType: string): Promise<ImageMetadata> {
  const metadata = await sharp(filepath).metadata();

  const width = metadata.width || 0;
  const height = metadata.height || 0;
  const aspectRatio = width / height;
  const orientation = getOrientation(width, height);

  return {
    width,
    height,
    aspectRatio,
    orientation,
    fileSize,
    mimeType,
  };
}

export async function createThumbnail(inputPath: string, outputPath: string, maxWidth: number = 400): Promise<void> {
  await sharp(inputPath)
    .resize(maxWidth, null, {
      withoutEnlargement: true,
      fit: "inside",
    })
    .jpeg({ quality: 80 })
    .toFile(outputPath);
}
