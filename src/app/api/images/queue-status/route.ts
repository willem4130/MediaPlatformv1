import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { jobQueue } from "@/lib/job-queue";

export async function GET(request: NextRequest) {
  try {
    const session = await auth();

    if (!session?.user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const status = jobQueue.getQueueStatus();

    return NextResponse.json(status);
  } catch (error) {
    console.error("Queue status API error:", error);
    return NextResponse.json(
      { error: "Failed to get queue status" },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const session = await auth();

    if (!session?.user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await request.json();
    const { imageIds } = body;

    if (!Array.isArray(imageIds)) {
      return NextResponse.json(
        { error: "imageIds must be an array" },
        { status: 400 }
      );
    }

    const jobs = jobQueue.getJobsByImageIds(imageIds);

    return NextResponse.json({ jobs });
  } catch (error) {
    console.error("Queue status API error:", error);
    return NextResponse.json(
      { error: "Failed to get job status" },
      { status: 500 }
    );
  }
}
