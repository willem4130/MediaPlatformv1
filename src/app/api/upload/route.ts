import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import formidable from "formidable";
import fs from "fs/promises";
import path from "path";
import { nanoid } from "nanoid";
import { extractImageMetadata, createThumbnail } from "@/lib/image-processing";
import { jobQueue } from "@/lib/job-queue";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

const UPLOAD_DIR = path.join(process.cwd(), "public", "uploads");
const MAX_FILE_SIZE = parseInt(process.env.MAX_FILE_SIZE || "26214400"); // 25MB
const MAX_FILES = parseInt(process.env.MAX_FILES_PER_BATCH || "50");

async function parseFormData(req: NextRequest): Promise<{ fields: formidable.Fields; files: formidable.Files }> {
  const form = formidable({
    uploadDir: UPLOAD_DIR,
    keepExtensions: true,
    maxFileSize: MAX_FILE_SIZE,
    maxFiles: MAX_FILES,
    filter: ({ mimetype }) => {
      return mimetype?.startsWith("image/") || false;
    },
  });

  return new Promise((resolve, reject) => {
    const nodeReq = req as any;
    form.parse(nodeReq, (err, fields, files) => {
      if (err) reject(err);
      else resolve({ fields, files });
    });
  });
}

export async function POST(request: NextRequest) {
  try {
    const session = await auth();

    if (!session?.user || (session.user as any).role !== "ADMIN") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { files } = await parseFormData(request);
    const uploadedFiles = Array.isArray(files.files) ? files.files : [files.files];
    const validFiles = uploadedFiles.filter(Boolean);

    if (validFiles.length === 0) {
      return NextResponse.json({ error: "No valid files uploaded" }, { status: 400 });
    }

    const now = new Date();
    const year = now.getFullYear();
    const month = String(now.getMonth() + 1).padStart(2, "0");
    const uploadSubDir = path.join(UPLOAD_DIR, "originals", String(year), month);
    const thumbnailSubDir = path.join(UPLOAD_DIR, "thumbnails", String(year), month);

    await fs.mkdir(uploadSubDir, { recursive: true });
    await fs.mkdir(thumbnailSubDir, { recursive: true });

    const results = [];

    for (const file of validFiles) {
      try {
        if (!file) continue;

        const fileId = nanoid();
        const ext = path.extname(file.originalFilename || "");
        const filename = `${fileId}${ext}`;
        const finalPath = path.join(uploadSubDir, filename);
        const thumbnailPath = path.join(thumbnailSubDir, filename);

        await fs.rename(file.filepath, finalPath);

        const webPath = `/uploads/originals/${year}/${month}/${filename}`;
        const thumbWebPath = `/uploads/thumbnails/${year}/${month}/${filename}`;

        const metadata = await extractImageMetadata(
          finalPath,
          file.size || 0,
          file.mimetype || "image/jpeg"
        );

        await createThumbnail(finalPath, thumbnailPath);

        const image = await prisma.image.create({
          data: {
            filename,
            originalName: file.originalFilename || filename,
            filepath: webPath,
            thumbnailPath: thumbWebPath,
            fileSize: metadata.fileSize,
            mimeType: metadata.mimeType,
            width: metadata.width,
            height: metadata.height,
            aspectRatio: metadata.aspectRatio,
            orientation: metadata.orientation,
            uploadedById: (session.user as any).id,
            aiSubjects: [],
            aiColors: [],
            userTags: [],
          },
        });

        jobQueue.addJob(image.id);

        results.push({
          id: image.id,
          filename: image.filename,
          filepath: image.filepath,
          thumbnailPath: image.thumbnailPath,
          status: "success",
          aiQueued: true,
        });

        console.log(`Image uploaded successfully: ${image.id}, AI analysis queued`);
      } catch (error) {
        console.error("Error processing file:", error);
        results.push({
          filename: file?.originalFilename || "unknown",
          status: "error",
          error: "Failed to process file",
        });
      }
    }

    return NextResponse.json({
      success: true,
      count: results.length,
      results,
    });
  } catch (error) {
    console.error("Upload error:", error);
    return NextResponse.json(
      { error: "Failed to upload files" },
      { status: 500 }
    );
  }
}
