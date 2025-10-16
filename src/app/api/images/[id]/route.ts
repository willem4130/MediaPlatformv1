import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import fs from "fs/promises";
import path from "path";

export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await auth();

    if (!session?.user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { id: imageId } = await params;

    const image = await prisma.image.findUnique({
      where: { id: imageId },
    });

    if (!image) {
      return NextResponse.json({ error: "Image not found" }, { status: 404 });
    }

    const fullPath = path.join(process.cwd(), "public", image.filepath);
    const thumbnailPath = image.thumbnailPath
      ? path.join(process.cwd(), "public", image.thumbnailPath)
      : null;

    try {
      await fs.unlink(fullPath);
      console.log(`Deleted original file: ${fullPath}`);
    } catch (error) {
      console.error(`Failed to delete original file: ${fullPath}`, error);
    }

    if (thumbnailPath) {
      try {
        await fs.unlink(thumbnailPath);
        console.log(`Deleted thumbnail: ${thumbnailPath}`);
      } catch (error) {
        console.error(`Failed to delete thumbnail: ${thumbnailPath}`, error);
      }
    }

    await prisma.image.delete({
      where: { id: imageId },
    });

    console.log(`Image deleted from database: ${imageId}`);

    return NextResponse.json({
      success: true,
      message: "Image deleted successfully",
      imageId,
    });
  } catch (error) {
    console.error("Delete image API error:", error);
    return NextResponse.json(
      { error: "Failed to delete image" },
      { status: 500 }
    );
  }
}
