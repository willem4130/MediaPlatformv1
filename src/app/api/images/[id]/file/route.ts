import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import fs from "fs/promises";
import path from "path";

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await auth();

    if (!session) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { id } = await params;

    const image = await prisma.image.findUnique({
      where: { id },
    });

    if (!image) {
      return NextResponse.json({ error: "Image not found" }, { status: 404 });
    }

    const searchParams = request.nextUrl.searchParams;
    const type = searchParams.get("type") || "original";

    let imagePath = image.filepath;
    let fallbackPath = null;

    if (type === "thumbnail" && image.thumbnailPath) {
      imagePath = image.thumbnailPath;
      fallbackPath = image.filepath;
    }

    const cleanPath = imagePath.startsWith("/")
      ? imagePath.slice(1)
      : imagePath;
    const filePath = path.join(process.cwd(), "public", cleanPath);

    console.log(`Serving ${type} for image ${id}:`, {
      dbPath: imagePath,
      cleanPath,
      fullPath: filePath,
      hasFallback: !!fallbackPath,
    });

    try {
      const fileBuffer = await fs.readFile(filePath);
      const arrayBuffer = fileBuffer.buffer.slice(
        fileBuffer.byteOffset,
        fileBuffer.byteOffset + fileBuffer.byteLength
      ) as ArrayBuffer;

      return new NextResponse(arrayBuffer, {
        headers: {
          "Content-Type": image.mimeType,
          "Cache-Control": "private, max-age=31536000, immutable",
        },
      });
    } catch (error) {
      if (fallbackPath) {
        console.log(`Thumbnail not found for ${id}, falling back to original`);
        const fallbackCleanPath = fallbackPath.startsWith("/")
          ? fallbackPath.slice(1)
          : fallbackPath;
        const fallbackFilePath = path.join(
          process.cwd(),
          "public",
          fallbackCleanPath
        );

        try {
          const fileBuffer = await fs.readFile(fallbackFilePath);
          const arrayBuffer = fileBuffer.buffer.slice(
            fileBuffer.byteOffset,
            fileBuffer.byteOffset + fileBuffer.byteLength
          ) as ArrayBuffer;

          return new NextResponse(arrayBuffer, {
            headers: {
              "Content-Type": image.mimeType,
              "Cache-Control": "private, max-age=31536000, immutable",
            },
          });
        } catch (fallbackError) {
          console.error(`Both thumbnail and original not found for ${id}`);
          return NextResponse.json(
            { error: "File not found" },
            { status: 404 }
          );
        }
      }

      console.error(`File not found for ${id}: ${filePath}`);
      return NextResponse.json({ error: "File not found" }, { status: 404 });
    }
  } catch (error) {
    console.error("File serving error:", error);
    return NextResponse.json(
      { error: "Failed to serve file" },
      { status: 500 }
    );
  }
}
