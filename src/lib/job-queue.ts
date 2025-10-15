import { processImageAI } from "./claude-ai";
import { extractImageMetadata, createThumbnail } from "./image-processing";
import path from "path";

interface Job {
  id: string;
  type: "ai-analysis" | "metadata-and-thumbnail";
  imageId: string;
  status: "pending" | "processing" | "complete" | "failed";
  createdAt: Date;
  processedAt?: Date;
  error?: string;
}

class SimpleJobQueue {
  private queue: Job[] = [];
  private processing = false;
  private concurrency = 1;

  addJob(
    imageId: string,
    type: "ai-analysis" | "metadata-and-thumbnail" = "ai-analysis"
  ): string {
    const job: Job = {
      id: `job-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
      type,
      imageId,
      status: "pending",
      createdAt: new Date(),
    };

    this.queue.push(job);
    this.processQueue();
    return job.id;
  }

  private async processQueue() {
    if (this.processing || this.queue.length === 0) {
      return;
    }

    this.processing = true;

    while (this.queue.length > 0) {
      const job = this.queue.shift();
      if (!job) break;

      job.status = "processing";

      try {
        if (job.type === "metadata-and-thumbnail") {
          await this.processMetadataAndThumbnail(job.imageId);
        } else if (job.type === "ai-analysis") {
          await processImageAI(job.imageId);
        }

        job.status = "complete";
        job.processedAt = new Date();
        console.log(`${job.type} job complete: ${job.imageId}`);
      } catch (error) {
        job.status = "failed";
        job.error = error instanceof Error ? error.message : "Unknown error";
        job.processedAt = new Date();
        console.error(`${job.type} job failed: ${job.imageId}`, error);
      }
    }

    this.processing = false;
  }

  private async processMetadataAndThumbnail(imageId: string): Promise<void> {
    const { prisma } = await import("./prisma");

    const image = await prisma.image.findUnique({
      where: { id: imageId },
    });

    if (!image) {
      throw new Error(`Image not found: ${imageId}`);
    }

    const fullPath = path.join(process.cwd(), "public", image.filepath);

    const metadata = await extractImageMetadata(
      fullPath,
      image.fileSize,
      image.mimeType
    );

    const pathParts = image.filepath.split("/").filter((p) => p);
    const filename = path.basename(image.filepath);

    const uploadsIndex = pathParts.indexOf("uploads");
    const originalsIndex = pathParts.indexOf("originals");

    let year = "2025";
    let month = "01";

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

    const fs = await import("fs/promises");
    await fs.mkdir(thumbnailDir, { recursive: true });

    await createThumbnail(fullPath, thumbnailPath);

    await fs.access(thumbnailPath);

    await prisma.image.update({
      where: { id: imageId },
      data: {
        width: metadata.width,
        height: metadata.height,
        aspectRatio: metadata.aspectRatio,
        orientation: metadata.orientation,
        thumbnailPath: thumbnailWebPath,
      },
    });

    console.log(
      `Metadata and thumbnail processed for image: ${imageId} -> ${thumbnailWebPath}`
    );
  }

  getQueueStatus() {
    return {
      pending: this.queue.filter((j) => j.status === "pending").length,
      processing: this.queue.filter((j) => j.status === "processing").length,
      total: this.queue.length,
    };
  }
}

export const jobQueue = new SimpleJobQueue();
