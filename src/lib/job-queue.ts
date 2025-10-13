import { processImageAI } from "./claude-ai";

interface Job {
  id: string;
  type: "ai-analysis";
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

  addJob(imageId: string): string {
    const job: Job = {
      id: `job-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
      type: "ai-analysis",
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
        console.log(`Processing AI analysis job for image: ${job.imageId}`);
        await processImageAI(job.imageId);
        job.status = "complete";
        job.processedAt = new Date();
        console.log(`AI analysis job complete: ${job.imageId}`);
      } catch (error) {
        job.status = "failed";
        job.error = error instanceof Error ? error.message : "Unknown error";
        job.processedAt = new Date();
        console.error(`AI analysis job failed: ${job.imageId}`, error);
      }
    }

    this.processing = false;
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
