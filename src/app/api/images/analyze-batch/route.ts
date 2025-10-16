import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { jobQueue } from "@/lib/job-queue";

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

    console.log(
      `[Batch Analysis] Queuing ${imageIds.length} images for AI analysis`
    );

    for (const imageId of imageIds) {
      jobQueue.addJob(imageId, "ai-analysis");
    }

    return NextResponse.json({
      success: true,
      message: `Queued ${imageIds.length} images for AI analysis`,
      count: imageIds.length,
    });
  } catch (error) {
    console.error("Batch analysis API error:", error);
    return NextResponse.json(
      { error: "Failed to queue batch AI analysis" },
      { status: 500 }
    );
  }
}
