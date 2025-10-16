import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import fs from "fs/promises";
import path from "path";

export async function POST(request: NextRequest) {
  try {
    const session = await auth();

    if (!session?.user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await request.json();
    const { imageIds } = body;

    if (!Array.isArray(imageIds) || imageIds.length === 0) {
      return NextResponse.json(
        { error: "imageIds must be a non-empty array" },
        { status: 400 }
      );
    }

    console.log(`[Batch Delete] Deleting ${imageIds.length} images`);

    const images = await prisma.image.findMany({
      where: { id: { in: imageIds } },
    });

    if (images.length === 0) {
      return NextResponse.json({ error: "No images found" }, { status: 404 });
    }

    const deletionResults = {
      filesDeleted: 0,
      thumbnailsDeleted: 0,
      dbRecordsDeleted: 0,
      errors: [] as string[],
    };

    for (const image of images) {
      const fullPath = path.join(process.cwd(), "public", image.filepath);
      const thumbnailPath = image.thumbnailPath
        ? path.join(process.cwd(), "public", image.thumbnailPath)
        : null;

      try {
        await fs.unlink(fullPath);
        deletionResults.filesDeleted++;
        console.log(`Deleted original file: ${fullPath}`);
      } catch (error) {
        console.error(`Failed to delete original file: ${fullPath}`, error);
        deletionResults.errors.push(
          `Failed to delete file for image ${image.id}`
        );
      }

      if (thumbnailPath) {
        try {
          await fs.unlink(thumbnailPath);
          deletionResults.thumbnailsDeleted++;
          console.log(`Deleted thumbnail: ${thumbnailPath}`);
        } catch (error) {
          console.error(`Failed to delete thumbnail: ${thumbnailPath}`, error);
        }
      }
    }

    const deleteResult = await prisma.image.deleteMany({
      where: { id: { in: imageIds } },
    });

    deletionResults.dbRecordsDeleted = deleteResult.count;

    console.log(
      `[Batch Delete] Complete: ${deletionResults.dbRecordsDeleted} DB records, ${deletionResults.filesDeleted} files, ${deletionResults.thumbnailsDeleted} thumbnails deleted`
    );

    return NextResponse.json({
      success: true,
      message: `Deleted ${deletionResults.dbRecordsDeleted} images`,
      details: deletionResults,
    });
  } catch (error) {
    console.error("Batch delete API error:", error);
    return NextResponse.json(
      { error: "Failed to delete images" },
      { status: 500 }
    );
  }
}
