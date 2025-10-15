import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export async function GET(request: NextRequest) {
  try {
    const session = await auth();

    if (!session) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const images = await prisma.image.findMany({
      orderBy: { createdAt: "desc" },
      select: {
        id: true,
        filename: true,
        originalName: true,
        filepath: true,
        thumbnailPath: true,
        fileSize: true,
        mimeType: true,
        width: true,
        height: true,
        aspectRatio: true,
        orientation: true,
        aiSubjects: true,
        aiStyle: true,
        aiMood: true,
        aiQualityScore: true,
        aiDescription: true,
        aiProcessingStatus: true,
        createdAt: true,
      },
    });

    const transformedImages = images.map((image) => ({
      id: image.id,
      fileName: image.filename,
      fileSize: image.fileSize,
      mimeType: image.mimeType,
      width: image.width,
      height: image.height,
      url: `/${image.filepath}`,
      thumbnailUrl: image.thumbnailPath ? `/${image.thumbnailPath}` : null,
      aspectRatio: image.aspectRatio.toString(),
      orientation: image.orientation,
      classification: {
        primary_subject: image.aiSubjects?.[0] || null,
        style: image.aiStyle,
        mood: image.aiMood,
        quality_score: image.aiQualityScore,
        description: image.aiDescription,
      },
      createdAt: image.createdAt.toISOString(),
    }));

    return NextResponse.json(transformedImages);
  } catch (error) {
    console.error("Error fetching images:", error);
    return NextResponse.json(
      { error: "Failed to fetch images" },
      { status: 500 }
    );
  }
}
