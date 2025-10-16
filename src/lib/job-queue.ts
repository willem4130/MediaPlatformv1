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
  private completedJobs: Job[] = [];
  private processing = false;
  private concurrency = 3;
  private activeJobs = 0;

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
    if (this.processing) {
      return;
    }

    this.processing = true;

    while (this.queue.length > 0 || this.activeJobs > 0) {
      while (this.activeJobs < this.concurrency && this.queue.length > 0) {
        const job = this.queue.shift();
        if (!job) break;

        this.activeJobs++;
        this.processJob(job);
      }

      if (this.queue.length === 0 && this.activeJobs === 0) {
        break;
      }

      await new Promise((resolve) => setTimeout(resolve, 100));
    }

    this.processing = false;
  }

  private async processJob(job: Job): Promise<void> {
    job.status = "processing";

    try {
      console.log(`[JobQueue] Starting ${job.type} for image: ${job.imageId}`);

      if (job.type === "metadata-and-thumbnail") {
        await this.processMetadataAndThumbnail(job.imageId);
      } else if (job.type === "ai-analysis") {
        await processImageAI(job.imageId);
      }

      job.status = "complete";
      job.processedAt = new Date();
      this.completedJobs.push(job);
      console.log(`[JobQueue] ✓ ${job.type} complete: ${job.imageId}`);
    } catch (error) {
      job.status = "failed";
      job.error = error instanceof Error ? error.message : "Unknown error";
      job.processedAt = new Date();
      this.completedJobs.push(job);
      console.error(`[JobQueue] ✗ ${job.type} FAILED for ${job.imageId}:`);
      console.error(`[JobQueue]   Error: ${job.error}`);
      if (error instanceof Error && error.stack) {
        console.error(
          `[JobQueue]   Stack: ${error.stack.split("\n").slice(0, 3).join("\n")}`
        );
      }
    } finally {
      this.activeJobs--;
    }
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
    const processingJobs = this.activeJobs;
    const pendingJobs = this.queue.filter((j) => j.status === "pending").length;
    const completedJobs = this.completedJobs.filter(
      (j) => j.status === "complete"
    ).length;
    const failedJobs = this.completedJobs.filter(
      (j) => j.status === "failed"
    ).length;

    return {
      pending: pendingJobs,
      processing: processingJobs,
      completed: completedJobs,
      failed: failedJobs,
      total: pendingJobs + processingJobs,
      isProcessing: this.processing,
    };
  }

  getJobsByImageIds(imageIds: string[]) {
    const allJobs = [...this.queue, ...this.completedJobs];
    return imageIds.map((imageId) => {
      const job = allJobs.find((j) => j.imageId === imageId);
      return {
        imageId,
        status: job?.status || "not-found",
        error: job?.error,
      };
    });
  }

  clearCompletedJobs() {
    this.completedJobs = this.completedJobs.filter(
      (j) => Date.now() - j.processedAt!.getTime() < 300000
    );
  }
}

export const jobQueue = new SimpleJobQueue();
