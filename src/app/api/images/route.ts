import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { Prisma } from "@prisma/client";

export async function GET(request: NextRequest) {
  try {
    const session = await auth();

    if (!session) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);

    // Pagination
    const page = parseInt(searchParams.get("page") || "1");
    const limit = parseInt(searchParams.get("limit") || "50");
    const skip = (page - 1) * limit;

    // Sorting
    const sortBy = searchParams.get("sortBy") || "date-desc";
    const orderBy = getOrderByClause(sortBy);

    // Filtering
    const where: Prisma.ImageWhereInput = {};

    // Search filter (filename or description)
    const search = searchParams.get("search");
    if (search) {
      where.OR = [
        { filename: { contains: search, mode: "insensitive" } },
        { originalName: { contains: search, mode: "insensitive" } },
        { aiDescription: { contains: search, mode: "insensitive" } },
      ];
    }

    // AI Subject filter
    const subjects = searchParams.get("subjects");
    if (subjects) {
      where.aiSubjects = {
        hasSome: subjects.split(","),
      };
    }

    // AI Style filter
    const styles = searchParams.get("styles");
    if (styles) {
      where.aiStyle = {
        in: styles.split(","),
      };
    }

    // AI Mood filter
    const moods = searchParams.get("moods");
    if (moods) {
      where.aiMood = {
        in: moods.split(","),
      };
    }

    // AI Lighting filter
    const lighting = searchParams.get("lighting");
    if (lighting) {
      where.aiLighting = {
        in: lighting.split(","),
      };
    }

    // Orientation filter
    const orientation = searchParams.get("orientation");
    if (orientation) {
      where.orientation = {
        in: orientation.split(",") as any,
      };
    }

    // Rating filter
    const ratings = searchParams.get("ratings");
    if (ratings) {
      where.rating = {
        in: ratings.split(",").map((r) => parseInt(r)),
      };
    }

    // Platform score filters
    const instagramMin = searchParams.get("instagramMin");
    if (instagramMin) {
      where.instagramScore = { gte: parseFloat(instagramMin) };
    }

    const facebookMin = searchParams.get("facebookMin");
    if (facebookMin) {
      where.facebookScore = { gte: parseFloat(facebookMin) };
    }

    const linkedinMin = searchParams.get("linkedinMin");
    if (linkedinMin) {
      where.linkedinScore = { gte: parseFloat(linkedinMin) };
    }

    const websiteHeroMin = searchParams.get("websiteHeroMin");
    if (websiteHeroMin) {
      where.websiteHeroScore = { gte: parseFloat(websiteHeroMin) };
    }

    // Fetch images with filters
    const [images, total] = await Promise.all([
      prisma.image.findMany({
        where,
        orderBy,
        skip,
        take: limit,
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
          aiLighting: true,
          aiComposition: true,
          aiColors: true,
          aiQualityScore: true,
          aiDescription: true,
          aiProcessingStatus: true,
          instagramScore: true,
          facebookScore: true,
          linkedinScore: true,
          websiteHeroScore: true,
          websiteThumbnailScore: true,
          printScore: true,
          rating: true,
          userTags: true,
          isPinned: true,
          isMarkedForPurchase: true,
          createdAt: true,
          updatedAt: true,
        },
      }),
      prisma.image.count({ where }),
    ]);

    const transformedImages = images.map((image) => ({
      id: image.id,
      fileName: image.filename,
      originalName: image.originalName,
      fileSize: image.fileSize,
      mimeType: image.mimeType,
      width: image.width,
      height: image.height,
      url: `/${image.filepath}`,
      thumbnailUrl: image.thumbnailPath ? `/${image.thumbnailPath}` : null,
      aspectRatio: image.aspectRatio.toString(),
      orientation: image.orientation,
      classification: {
        subjects: image.aiSubjects || [],
        primary_subject: image.aiSubjects?.[0] || null,
        style: image.aiStyle,
        mood: image.aiMood,
        lighting: image.aiLighting,
        composition: image.aiComposition,
        colors: image.aiColors || [],
        quality_score: image.aiQualityScore,
        description: image.aiDescription,
        processing_status: image.aiProcessingStatus,
      },
      platformScores: {
        instagram: image.instagramScore,
        facebook: image.facebookScore,
        linkedin: image.linkedinScore,
        websiteHero: image.websiteHeroScore,
        websiteThumbnail: image.websiteThumbnailScore,
        print: image.printScore,
      },
      rating: image.rating,
      userTags: image.userTags || [],
      isPinned: image.isPinned,
      isMarkedForPurchase: image.isMarkedForPurchase,
      createdAt: image.createdAt.toISOString(),
      updatedAt: image.updatedAt.toISOString(),
    }));

    return NextResponse.json({
      images: transformedImages,
      pagination: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit),
        hasMore: skip + limit < total,
      },
    });
  } catch (error) {
    console.error("Error fetching images:", error);
    return NextResponse.json(
      { error: "Failed to fetch images" },
      { status: 500 }
    );
  }
}

function getOrderByClause(
  sortBy: string
): Prisma.ImageOrderByWithRelationInput {
  switch (sortBy) {
    case "date-desc":
      return { createdAt: "desc" };
    case "date-asc":
      return { createdAt: "asc" };
    case "rating-desc":
      return { rating: "desc" };
    case "rating-asc":
      return { rating: "asc" };
    case "name-asc":
      return { filename: "asc" };
    case "name-desc":
      return { filename: "desc" };
    default:
      return { createdAt: "desc" };
  }
}
