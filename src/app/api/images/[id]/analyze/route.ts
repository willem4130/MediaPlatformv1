import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { processImageAI } from "@/lib/claude-ai";

export async function POST(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const session = await auth();

    if (!session?.user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const imageId = params.id;

    processImageAI(imageId).catch((error) => {
      console.error(`Background AI processing failed for ${imageId}:`, error);
    });

    return NextResponse.json({
      success: true,
      message: "AI analysis queued",
      imageId,
    });
  } catch (error) {
    console.error("Analyze API error:", error);
    return NextResponse.json(
      { error: "Failed to queue AI analysis" },
      { status: 500 }
    );
  }
}
