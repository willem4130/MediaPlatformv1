import { PrismaClient } from "@prisma/client";
import { createThumbnail } from "../src/lib/image-processing";
import path from "path";
import fs from "fs/promises";

const prisma = new PrismaClient();

async function regenerateAllThumbnails() {
  console.log("Fetching all images...");

  const images = await prisma.image.findMany({
    select: {
      id: true,
      filename: true,
      filepath: true,
      thumbnailPath: true,
    },
  });

  console.log(`Found ${images.length} images`);

  for (const image of images) {
    try {
      console.log(`\nProcessing: ${image.filename}`);

      const fullPath = path.join(process.cwd(), "public", image.filepath);

      // Check if original exists
      try {
        await fs.access(fullPath);
      } catch {
        console.log(`  ❌ Original not found: ${fullPath}`);
        continue;
      }

      // Parse path to extract year/month
      const pathParts = image.filepath.split("/").filter((p) => p);
      const filename = path.basename(image.filepath);

      const uploadsIndex = pathParts.indexOf("uploads");
      const originalsIndex = pathParts.indexOf("originals");

      let year = "2025";
      let month = "10";

      if (
        uploadsIndex >= 0 &&
        originalsIndex >= 0 &&
        originalsIndex === uploadsIndex + 1
      ) {
        year = pathParts[originalsIndex + 1] || year;
        month = pathParts[originalsIndex + 2] || month;
      }

      const thumbnailDir = path.join(
        process.cwd(),
        "public",
        "uploads",
        "thumbnails",
        year,
        month
      );
      const thumbnailPath = path.join(thumbnailDir, filename);
      const thumbnailWebPath = `uploads/thumbnails/${year}/${month}/${filename}`;

      // Check if thumbnail already exists
      try {
        await fs.access(thumbnailPath);
        console.log(`  ✓ Thumbnail exists: ${thumbnailWebPath}`);

        // Update DB if path is wrong
        if (image.thumbnailPath !== thumbnailWebPath) {
          await prisma.image.update({
            where: { id: image.id },
            data: { thumbnailPath: thumbnailWebPath },
          });
          console.log("  ✓ Updated DB path");
        }
        continue;
      } catch {
        // Thumbnail doesn't exist, create it
        console.log("  🔨 Creating thumbnail...");
      }

      await fs.mkdir(thumbnailDir, { recursive: true });
      await createThumbnail(fullPath, thumbnailPath);

      await prisma.image.update({
        where: { id: image.id },
        data: { thumbnailPath: thumbnailWebPath },
      });

      console.log(`  ✅ Created: ${thumbnailWebPath}`);
    } catch (error) {
      console.error(`  ❌ Error processing ${image.filename}:`, error);
    }
  }

  console.log("\n✅ Thumbnail regeneration complete!");
}

regenerateAllThumbnails()
  .catch(console.error)
  .finally(() => prisma.$disconnect());
