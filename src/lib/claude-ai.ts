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
}

const ANALYSIS_PROMPT = `Analyze this image for a media asset management system.

Provide a JSON response with:
1. subjects: Array of main subjects (people, animals, landscapes, objects, actions). Be specific.
2. style: Photography style (documentary, editorial, commercial, artistic, candid, posed, dramatic, minimalist)
3. mood: Emotional tone (energetic, peaceful, dramatic, intimate, celebratory, melancholic, powerful, serene)
4. composition: Main composition technique (rule-of-thirds, centered, symmetrical, leading-lines, frame-within-frame, diagonal, golden-ratio)
5. lighting: Lighting quality (golden-hour, harsh-midday, soft-diffused, dramatic-backlit, studio, natural-overcast, sunset, sunrise)
6. colors: Top 3-5 dominant colors (specific names like "burnt-orange", "deep-blue", "olive-green")
7. qualityScore: Technical quality 0-10 (sharpness, exposure, noise, focus)
8. description: 2-3 sentence detailed description of what you see

Then grade suitability (0-10) for these platforms:
- instagram: Square/4:5 crops work well, high visual impact, vibrant, eye-catching
- facebook: 16:9 format, storytelling, emotional connection, shareable
- linkedin: Professional context, 1.91:1 or 4:5, business-appropriate, polished
- websiteHero: 16:9 dramatic wide shots, attention-grabbing, brand-defining
- websiteThumbnail: Clear subject, recognizable at small sizes, good contrast
- print: High resolution potential, timeless composition, fine detail

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
  "printScore": 9.0
}`;

export async function analyzeImage(imagePath: string): Promise<AIAnalysisResult> {
  try {
    const fullPath = path.join(process.cwd(), "public", imagePath);
    const imageData = await fs.readFile(fullPath);
    const base64Image = imageData.toString("base64");

    const mimeType = imagePath.endsWith(".png")
      ? "image/png"
      : imagePath.endsWith(".webp")
      ? "image/webp"
      : "image/jpeg";

    const message = await anthropic.messages.create({
      model: "claude-3-5-sonnet-20241022",
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

    const firstBlock = message.content[0];
    const responseText = firstBlock && firstBlock.type === "text" ? firstBlock.text : "";

    const jsonMatch = responseText.match(/\{[\s\S]*\}/);
    if (!jsonMatch) {
      throw new Error("No valid JSON found in response");
    }

    const analysis: AIAnalysisResult = JSON.parse(jsonMatch[0]);

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
      websiteHeroScore: Math.max(0, Math.min(10, analysis.websiteHeroScore || 5)),
      websiteThumbnailScore: Math.max(0, Math.min(10, analysis.websiteThumbnailScore || 5)),
      printScore: Math.max(0, Math.min(10, analysis.printScore || 5)),
    };
  } catch (error) {
    console.error("Claude AI analysis error:", error);
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
