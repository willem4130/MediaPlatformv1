import Anthropic from "@anthropic-ai/sdk";
import fs from "fs/promises";
import path from "path";

const anthropic = new Anthropic({
  apiKey: process.env.ANTHROPIC_API_KEY,
});

export interface AIAnalysisResult {
  subjects: string[];
  style: string;
  mood: string;
  composition: string;
  lighting: string;
  colors: string[];
  qualityScore: number;
  description: string;
  instagramScore: number;
  facebookScore: number;
  linkedinScore: number;
  websiteHeroScore: number;
  websiteThumbnailScore: number;
  printScore: number;
  // Enhanced use-case recommendations
  bestUseCases: string[];
  notRecommendedFor: string[];
  cropRecommendations: {
    square: number;
    portrait: number;
    landscape: number;
  };
  technicalNotes: string;
}

const ANALYSIS_PROMPT = `Analyze this image for a media asset management system. Provide comprehensive classification for marketing use.

Provide a JSON response with:

1. subjects: Array of main subjects (people, animals, landscapes, objects, actions). Be specific.
2. style: Photography style (documentary, editorial, commercial, artistic, candid, posed, dramatic, minimalist)
3. mood: Emotional tone (energetic, peaceful, dramatic, intimate, celebratory, melancholic, powerful, serene)
4. composition: Main composition technique (rule-of-thirds, centered, symmetrical, leading-lines, frame-within-frame, diagonal, golden-ratio)
5. lighting: Lighting quality (golden-hour, harsh-midday, soft-diffused, dramatic-backlit, studio, natural-overcast, sunset, sunrise)
6. colors: Top 3-5 dominant colors (specific names like "burnt-orange", "deep-blue", "olive-green")
7. qualityScore: Technical quality 0-10 (sharpness, exposure, noise, focus)
8. description: 2-3 sentence detailed description of what you see

Platform Suitability (0-10):
- instagram: Square/4:5 crops, high visual impact, vibrant, eye-catching, social engagement
- facebook: 16:9 format, storytelling, emotional connection, shareable, broad appeal
- linkedin: Professional context, 1.91:1 or 4:5, business-appropriate, polished, career-focused
- websiteHero: 16:9 dramatic wide shots, attention-grabbing, brand-defining, above-fold impact
- websiteThumbnail: Clear subject, recognizable at small sizes, good contrast, quick recognition
- print: High resolution potential, timeless composition, fine detail, physical reproduction quality

Use Case Recommendations:
- bestUseCases: Array of 3-5 SPECIFIC use cases this image is PERFECT for. Examples:
  * "Instagram Stories - Lifestyle brand storytelling"
  * "Website hero banner - Above-fold impact for ranch/farm business"
  * "Print magazine full-page spread - Editorial quality"
  * "LinkedIn company page header - Professional brand image"
  * "Facebook ad campaign - Product showcase with emotional appeal"
  * "Marketing brochure cover - Premium print collateral"
  * "Email newsletter header - Attention-grabbing opener"
  * "Social media carousel post - Multi-image storytelling"
  * "Billboard advertising - Large format outdoor"
  * "Product packaging photography - E-commerce detail shots"

- notRecommendedFor: Array of 2-3 use cases this image is NOT suitable for and why. Examples:
  * "Instagram feed post - Poor crop potential for square format"
  * "Small thumbnail - Too much detail, loses impact when scaled down"
  * "Print at large scale - Resolution too low, will appear pixelated"
  * "LinkedIn professional headshot - Too casual/informal"

- cropRecommendations: How well this image crops to different aspect ratios (0-10):
  * square: Instagram 1:1 crop viability
  * portrait: 4:5 or 9:16 vertical crop viability
  * landscape: 16:9 or 21:9 horizontal crop viability

- technicalNotes: One sentence about technical considerations. Examples:
  * "Excellent sharpness and dynamic range, ideal for large-format printing"
  * "Slight motion blur adds energy but limits use for detail-critical applications"
  * "High contrast with deep shadows - may need adjustment for web use"
  * "Soft focus creates dreamy mood but reduces print suitability"

Return ONLY valid JSON with this exact structure:
{
  "subjects": ["subject1", "subject2"],
  "style": "style-name",
  "mood": "mood-name",
  "composition": "composition-technique",
  "lighting": "lighting-type",
  "colors": ["color1", "color2", "color3"],
  "qualityScore": 8.5,
  "description": "Description here",
  "instagramScore": 9.0,
  "facebookScore": 8.5,
  "linkedinScore": 7.0,
  "websiteHeroScore": 9.5,
  "websiteThumbnailScore": 8.0,
  "printScore": 9.0,
  "bestUseCases": ["Instagram Stories - Lifestyle brand storytelling", "Website hero banner - Ranch business homepage", "Print magazine spread - Editorial quality"],
  "notRecommendedFor": ["Small thumbnail - Too much detail", "LinkedIn professional headshot - Too dramatic"],
  "cropRecommendations": {
    "square": 8.5,
    "portrait": 7.0,
    "landscape": 9.5
  },
  "technicalNotes": "Excellent sharpness and dynamic range, ideal for large-format printing"
}`;

export async function analyzeImage(
  imagePath: string
): Promise<AIAnalysisResult> {
  try {
    console.log(`[ClaudeAI] Analyzing image: ${imagePath}`);

    if (!process.env.ANTHROPIC_API_KEY) {
      throw new Error("ANTHROPIC_API_KEY environment variable is not set");
    }

    const fullPath = path.join(process.cwd(), "public", imagePath);
    console.log(`[ClaudeAI] Reading from: ${fullPath}`);

    const imageData = await fs.readFile(fullPath);
    const base64Image = imageData.toString("base64");
    console.log(`[ClaudeAI] Image loaded, size: ${imageData.length} bytes`);

    const mimeType = imagePath.endsWith(".png")
      ? "image/png"
      : imagePath.endsWith(".webp")
        ? "image/webp"
        : "image/jpeg";

    const model = process.env.CLAUDE_MODEL || "claude-3-haiku-20240307";
    console.log(
      `[ClaudeAI] Sending request to Claude API (${mimeType}) using model: ${model}...`
    );

    const message = await anthropic.messages.create({
      model,
      max_tokens: 2000,
      messages: [
        {
          role: "user",
          content: [
            {
              type: "image",
              source: {
                type: "base64",
                media_type: mimeType,
                data: base64Image,
              },
            },
            {
              type: "text",
              text: ANALYSIS_PROMPT,
            },
          ],
        },
      ],
    });

    console.log("[ClaudeAI] Received response from Claude API");

    const firstBlock = message.content[0];
    const responseText =
      firstBlock && firstBlock.type === "text" ? firstBlock.text : "";

    const jsonMatch = responseText.match(/\{[\s\S]*\}/);
    if (!jsonMatch) {
      console.error(
        "[ClaudeAI] No JSON found in response. Response text:",
        responseText.substring(0, 200)
      );
      throw new Error("No valid JSON found in response");
    }

    const analysis: AIAnalysisResult = JSON.parse(jsonMatch[0]);
    console.log("[ClaudeAI] Successfully parsed analysis results");

    return {
      subjects: analysis.subjects || [],
      style: analysis.style || "unknown",
      mood: analysis.mood || "neutral",
      composition: analysis.composition || "unknown",
      lighting: analysis.lighting || "unknown",
      colors: analysis.colors || [],
      qualityScore: Math.max(0, Math.min(10, analysis.qualityScore || 5)),
      description: analysis.description || "",
      instagramScore: Math.max(0, Math.min(10, analysis.instagramScore || 5)),
      facebookScore: Math.max(0, Math.min(10, analysis.facebookScore || 5)),
      linkedinScore: Math.max(0, Math.min(10, analysis.linkedinScore || 5)),
      websiteHeroScore: Math.max(
        0,
        Math.min(10, analysis.websiteHeroScore || 5)
      ),
      websiteThumbnailScore: Math.max(
        0,
        Math.min(10, analysis.websiteThumbnailScore || 5)
      ),
      printScore: Math.max(0, Math.min(10, analysis.printScore || 5)),
      bestUseCases: analysis.bestUseCases || [],
      notRecommendedFor: analysis.notRecommendedFor || [],
      cropRecommendations: {
        square: Math.max(
          0,
          Math.min(10, analysis.cropRecommendations?.square || 5)
        ),
        portrait: Math.max(
          0,
          Math.min(10, analysis.cropRecommendations?.portrait || 5)
        ),
        landscape: Math.max(
          0,
          Math.min(10, analysis.cropRecommendations?.landscape || 5)
        ),
      },
      technicalNotes: analysis.technicalNotes || "No technical notes available",
    };
  } catch (error) {
    console.error("[ClaudeAI] Analysis error:", error);
    if (error instanceof Error) {
      console.error("[ClaudeAI] Error message:", error.message);
      console.error(
        "[ClaudeAI] Error stack:",
        error.stack?.split("\n").slice(0, 5).join("\n")
      );
    }
    throw error;
  }
}

export async function processImageAI(imageId: string): Promise<void> {
  const { prisma } = await import("./prisma");

  try {
    const image = await prisma.image.findUnique({
      where: { id: imageId },
    });

    if (!image) {
      throw new Error(`Image not found: ${imageId}`);
    }

    await prisma.image.update({
      where: { id: imageId },
      data: { aiProcessingStatus: "processing" },
    });

    const analysis = await analyzeImage(image.filepath);

    await prisma.image.update({
      where: { id: imageId },
      data: {
        aiSubjects: analysis.subjects,
        aiStyle: analysis.style,
        aiMood: analysis.mood,
        aiQualityScore: analysis.qualityScore,
        aiComposition: analysis.composition,
        aiLighting: analysis.lighting,
        aiColors: analysis.colors,
        aiDescription: analysis.description,
        instagramScore: analysis.instagramScore,
        facebookScore: analysis.facebookScore,
        linkedinScore: analysis.linkedinScore,
        websiteHeroScore: analysis.websiteHeroScore,
        websiteThumbnailScore: analysis.websiteThumbnailScore,
        printScore: analysis.printScore,
        aiBestUseCases: analysis.bestUseCases,
        aiNotRecommendedFor: analysis.notRecommendedFor,
        aiCropSquare: analysis.cropRecommendations.square,
        aiCropPortrait: analysis.cropRecommendations.portrait,
        aiCropLandscape: analysis.cropRecommendations.landscape,
        aiTechnicalNotes: analysis.technicalNotes,
        aiProcessingStatus: "complete",
        aiProcessedAt: new Date(),
      },
    });

    console.log(`AI analysis complete for image: ${imageId}`);
  } catch (error) {
    console.error(`AI processing failed for image ${imageId}:`, error);

    await prisma.image.update({
      where: { id: imageId },
      data: { aiProcessingStatus: "failed" },
    });

    throw error;
  }
}
