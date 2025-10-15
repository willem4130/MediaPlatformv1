import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import fs from "fs/promises";
import path from "path";
import { nanoid } from "nanoid";
import { jobQueue } from "@/lib/job-queue";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

const UPLOAD_DIR = path.join(process.cwd(), "public", "uploads");
const MAX_FILE_SIZE = parseInt(process.env.MAX_FILE_SIZE || "26214400"); // 25MB

export async function POST(request: NextRequest) {
  try {
    const session = await auth();

    if (!session?.user || (session.user as any).role !== "ADMIN") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const formData = await request.formData();
    const files = formData.getAll("files") as File[];

    if (files.length === 0) {
      return NextResponse.json({ error: "No files uploaded" }, { status: 400 });
    }

    const now = new Date();
    const year = now.getFullYear();
    const month = String(now.getMonth() + 1).padStart(2, "0");
    const uploadSubDir = path.join(
      UPLOAD_DIR,
      "originals",
      String(year),
      month
    );

    await fs.mkdir(uploadSubDir, { recursive: true });

    const imageRecords = [];

    for (const file of files) {
      try {
        if (!file.type.startsWith("image/")) {
          console.warn(`Skipping non-image file: ${file.name}`);
          continue;
        }

        if (file.size > MAX_FILE_SIZE) {
          console.warn(`File too large: ${file.name} (${file.size} bytes)`);
          continue;
        }

        const fileId = nanoid();
        const ext = path.extname(file.name);
        const filename = `${fileId}${ext}`;
        const finalPath = path.join(uploadSubDir, filename);
        const webPath = `uploads/originals/${year}/${month}/${filename}`;

        const arrayBuffer = await file.arrayBuffer();
        await fs.writeFile(finalPath, Buffer.from(arrayBuffer));

        imageRecords.push({
          filename,
          originalName: file.name,
          filepath: webPath,
          thumbnailPath: null,
          fileSize: file.size,
          mimeType: file.type,
          width: 0,
          height: 0,
          aspectRatio: 1.0,
          orientation: "SQUARE" as const,
          uploadedById: (session.user as any).id,
          aiSubjects: [],
          aiColors: [],
          userTags: [],
          aiProcessingStatus: "pending",
        });
      } catch (error) {
        console.error(`Error processing file ${file.name}:`, error);
      }
    }

    if (imageRecords.length === 0) {
      return NextResponse.json(
        { error: "No valid images to upload" },
        { status: 400 }
      );
    }

    const images = await prisma.image.createMany({
      data: imageRecords,
    });

    const createdImages = await prisma.image.findMany({
      where: {
        filename: { in: imageRecords.map((r) => r.filename) },
      },
      select: { id: true, filename: true, filepath: true },
    });

    for (const image of createdImages) {
      jobQueue.addJob(image.id, "metadata-and-thumbnail");
      jobQueue.addJob(image.id, "ai-analysis");
    }

    console.log(`Uploaded ${images.count} images, queued for processing`);

    return NextResponse.json({
      success: true,
      count: images.count,
      results: createdImages.map((img) => ({
        id: img.id,
        filename: img.filename,
        filepath: img.filepath,
        status: "success",
        processing: "queued",
      })),
    });
  } catch (error) {
    console.error("Upload error:", error);
    return NextResponse.json(
      { error: "Failed to upload files" },
      { status: 500 }
    );
  }
}
