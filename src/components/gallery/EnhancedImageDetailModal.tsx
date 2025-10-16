"use client";

import { useState, useEffect } from "react";
import Image from "next/image";
import {
  X,
  ChevronLeft,
  ChevronRight,
  Download,
  Star,
  Tag,
  Info,
  BarChart3,
  Calendar,
  FileImage,
  Palette,
  Eye,
  Maximize,
  Minimize,
  Target,
  CheckCircle2,
  XCircle,
  Crop,
  AlertCircle,
  RefreshCw,
} from "lucide-react";
import { formatAspectRatioFromDecimal } from "@/lib/utils";

interface ImageData {
  id: string;
  fileName: string;
  originalName: string;
  fileSize: number;
  mimeType: string;
  width: number;
  height: number;
  url: string;
  thumbnailUrl: string | null;
  aspectRatio: string;
  orientation: string;
  classification: {
    subjects: string[];
    primary_subject: string | null;
    style: string | null;
    mood: string | null;
    lighting: string | null;
    composition: string | null;
    colors: string[];
    quality_score: number | null;
    description: string | null;
    processing_status: string;
    best_use_cases?: string[];
    not_recommended_for?: string[];
    crop_recommendations?: {
      square: number | null;
      portrait: number | null;
      landscape: number | null;
    };
    technical_notes?: string | null;
  };
  platformScores: {
    instagram: number | null;
    facebook: number | null;
    linkedin: number | null;
    websiteHero: number | null;
    websiteThumbnail: number | null;
    print: number | null;
  };
  rating: number | null;
  userTags: string[];
  isPinned: boolean;
  isMarkedForPurchase: boolean;
  createdAt: string;
  updatedAt: string;
}

interface EnhancedImageDetailModalProps {
  image: ImageData;
  images: ImageData[];
  onClose: () => void;
  onNavigate: (direction: "prev" | "next") => void;
}

type TabType = "ai" | "use-cases" | "metadata" | "actions";

export function EnhancedImageDetailModal({
  image,
  images,
  onClose,
  onNavigate,
}: EnhancedImageDetailModalProps) {
  const [activeTab, setActiveTab] = useState<TabType>("ai");
  const [userRating, setUserRating] = useState(image.rating || 0);
  const [isRetrying, setIsRetrying] = useState(false);
  const [retryError, setRetryError] = useState<string | null>(null);

  const currentIndex = images.findIndex((img) => img.id === image.id);
  const hasPrev = currentIndex > 0;
  const hasNext = currentIndex < images.length - 1;

  const [isFullscreen, setIsFullscreen] = useState(false);

  const handleRetryAI = async () => {
    setIsRetrying(true);
    setRetryError(null);

    try {
      const response = await fetch(`/api/images/${image.id}/analyze`, {
        method: "POST",
      });

      if (!response.ok) {
        throw new Error("Failed to queue AI analysis");
      }

      setTimeout(() => {
        window.location.reload();
      }, 2000);
    } catch (error) {
      setRetryError(error instanceof Error ? error.message : "Retry failed");
      setIsRetrying(false);
    }
  };

  // Keyboard navigation (ESC, Arrow keys, F for fullscreen)
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        onClose();
      } else if (e.key === "ArrowLeft" && hasPrev) {
        onNavigate("prev");
      } else if (e.key === "ArrowRight" && hasNext) {
        onNavigate("next");
      } else if (e.key === "f" || e.key === "F") {
        setIsFullscreen(!isFullscreen);
      }
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [onClose, hasPrev, hasNext, onNavigate, isFullscreen]);

  const formatFileSize = (bytes: number) => {
    if (bytes < 1024) return `${bytes} B`;
    if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
    return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString("en-US", {
      year: "numeric",
      month: "long",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm">
      {/* Top controls */}
      <div className="absolute right-4 top-4 z-10 flex gap-2">
        <button
          onClick={() => setIsFullscreen(!isFullscreen)}
          className="rounded-lg p-2 text-white transition-colors hover:bg-white/20"
          title={isFullscreen ? "Exit fullscreen (F)" : "Fullscreen (F)"}
        >
          {isFullscreen ? (
            <Minimize className="h-6 w-6" />
          ) : (
            <Maximize className="h-6 w-6" />
          )}
        </button>
        <button
          onClick={onClose}
          className="rounded-lg p-2 text-white transition-colors hover:bg-white/20"
          title="Close (ESC)"
        >
          <X className="h-6 w-6" />
        </button>
      </div>

      {/* Navigation arrows */}
      {hasPrev && (
        <button
          onClick={() => onNavigate("prev")}
          className="absolute left-4 top-1/2 z-10 -translate-y-1/2 rounded-lg p-3 text-white transition-colors hover:bg-white/20"
        >
          <ChevronLeft className="h-8 w-8" />
        </button>
      )}

      {hasNext && (
        <button
          onClick={() => onNavigate("next")}
          className="absolute right-4 top-1/2 z-10 -translate-y-1/2 rounded-lg p-3 text-white transition-colors hover:bg-white/20"
        >
          <ChevronRight className="h-8 w-8" />
        </button>
      )}

      {/* Content */}
      <div
        className={`mx-auto flex h-full w-full gap-4 p-4 ${isFullscreen ? "" : "max-w-7xl"}`}
      >
        {/* Image viewer */}
        <div
          className={`flex items-center justify-center ${isFullscreen ? "flex-1 p-12" : "flex-1"}`}
        >
          <div className="relative h-full w-full">
            <Image
              src={image.url}
              alt={image.originalName}
              fill
              className="object-contain"
              unoptimized
              priority
            />
          </div>
        </div>

        {/* Side panel - hidden in fullscreen */}
        {!isFullscreen && (
          <div className="flex w-96 flex-col overflow-hidden rounded-lg bg-white">
            {/* Header */}
            <div className="border-b border-gray-200 p-4">
              <h2 className="truncate text-lg font-semibold text-gray-900">
                {image.originalName}
              </h2>
              <p className="text-sm text-gray-500">
                {currentIndex + 1} of {images.length}
              </p>
            </div>

            {/* Tabs */}
            <div className="flex border-b border-gray-200 bg-gray-50">
              <button
                onClick={() => setActiveTab("ai")}
                className={`flex flex-1 items-center justify-center gap-1 px-3 py-3 text-xs font-medium transition-colors ${
                  activeTab === "ai"
                    ? "border-b-2 border-primary bg-white text-primary"
                    : "text-gray-600 hover:text-gray-900"
                }`}
              >
                <Eye className="h-4 w-4" />
                AI
              </button>
              <button
                onClick={() => setActiveTab("use-cases")}
                className={`flex flex-1 items-center justify-center gap-1 px-3 py-3 text-xs font-medium transition-colors ${
                  activeTab === "use-cases"
                    ? "border-b-2 border-primary bg-white text-primary"
                    : "text-gray-600 hover:text-gray-900"
                }`}
              >
                <Target className="h-4 w-4" />
                Uses
              </button>
              <button
                onClick={() => setActiveTab("metadata")}
                className={`flex flex-1 items-center justify-center gap-1 px-3 py-3 text-xs font-medium transition-colors ${
                  activeTab === "metadata"
                    ? "border-b-2 border-primary bg-white text-primary"
                    : "text-gray-600 hover:text-gray-900"
                }`}
              >
                <Info className="h-4 w-4" />
                Info
              </button>
              <button
                onClick={() => setActiveTab("actions")}
                className={`flex flex-1 items-center justify-center gap-1 px-3 py-3 text-xs font-medium transition-colors ${
                  activeTab === "actions"
                    ? "border-b-2 border-primary bg-white text-primary"
                    : "text-gray-600 hover:text-gray-900"
                }`}
              >
                <BarChart3 className="h-4 w-4" />
                Scores
              </button>
            </div>

            {/* Tab content */}
            <div className="flex-1 overflow-y-auto p-4">
              {activeTab === "ai" && (
                <div className="space-y-4">
                  {/* Processing Status Messages */}
                  {image.classification.processing_status === "pending" && (
                    <div className="rounded-lg border border-blue-200 bg-blue-50 p-4">
                      <div className="flex items-start gap-3">
                        <div className="h-5 w-5 animate-spin rounded-full border-2 border-blue-600 border-t-transparent" />
                        <div>
                          <h3 className="text-sm font-semibold text-blue-900">
                            AI Analysis Pending
                          </h3>
                          <p className="mt-1 text-sm text-blue-800">
                            This image is queued for analysis. Refresh the page
                            in a few moments to see results.
                          </p>
                        </div>
                      </div>
                    </div>
                  )}

                  {image.classification.processing_status === "processing" && (
                    <div className="rounded-lg border border-purple-200 bg-purple-50 p-4">
                      <div className="flex items-start gap-3">
                        <div className="h-5 w-5 animate-spin rounded-full border-2 border-purple-600 border-t-transparent" />
                        <div>
                          <h3 className="text-sm font-semibold text-purple-900">
                            Analyzing with Claude AI
                          </h3>
                          <p className="mt-1 text-sm text-purple-800">
                            AI is currently analyzing this image. This usually
                            takes 5-10 seconds.
                          </p>
                        </div>
                      </div>
                    </div>
                  )}

                  {image.classification.processing_status === "failed" && (
                    <div className="rounded-lg border border-red-200 bg-red-50 p-4">
                      <div className="flex items-start gap-3">
                        <AlertCircle className="h-5 w-5 flex-shrink-0 text-red-600" />
                        <div className="flex-1">
                          <h3 className="text-sm font-semibold text-red-900">
                            AI Analysis Failed
                          </h3>
                          <p className="mt-1 text-sm text-red-800">
                            The AI analysis could not be completed. This might
                            be due to API configuration or image format issues.
                          </p>
                          {retryError && (
                            <p className="mt-2 text-xs text-red-700">
                              Error: {retryError}
                            </p>
                          )}
                          <button
                            onClick={handleRetryAI}
                            disabled={isRetrying}
                            className="mt-3 flex items-center gap-2 rounded-md bg-red-600 px-3 py-1.5 text-sm font-medium text-white transition-colors hover:bg-red-700 disabled:opacity-50"
                          >
                            <RefreshCw
                              className={`h-4 w-4 ${isRetrying ? "animate-spin" : ""}`}
                            />
                            {isRetrying ? "Retrying..." : "Retry Analysis"}
                          </button>
                        </div>
                      </div>
                    </div>
                  )}

                  {/* Description */}
                  {image.classification.description && (
                    <div>
                      <h3 className="mb-2 text-sm font-semibold text-gray-900">
                        Description
                      </h3>
                      <p className="text-sm text-gray-600">
                        {image.classification.description}
                      </p>
                    </div>
                  )}

                  {/* Subjects */}
                  {image.classification.subjects.length > 0 && (
                    <div>
                      <h3 className="mb-2 text-sm font-semibold text-gray-900">
                        Subjects
                      </h3>
                      <div className="flex flex-wrap gap-2">
                        {image.classification.subjects.map((subject) => (
                          <span
                            key={subject}
                            className="inline-flex items-center rounded-full bg-blue-100 px-3 py-1 text-sm font-medium text-blue-800"
                          >
                            {subject}
                          </span>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* Style & Mood */}
                  <div className="grid grid-cols-2 gap-4">
                    {image.classification.style && (
                      <div>
                        <h3 className="mb-2 text-sm font-semibold text-gray-900">
                          Style
                        </h3>
                        <span className="inline-flex items-center rounded-full bg-purple-100 px-3 py-1 text-sm font-medium text-purple-800">
                          {image.classification.style}
                        </span>
                      </div>
                    )}

                    {image.classification.mood && (
                      <div>
                        <h3 className="mb-2 text-sm font-semibold text-gray-900">
                          Mood
                        </h3>
                        <span className="inline-flex items-center rounded-full bg-pink-100 px-3 py-1 text-sm font-medium text-pink-800">
                          {image.classification.mood}
                        </span>
                      </div>
                    )}
                  </div>

                  {/* Lighting & Composition */}
                  <div className="grid grid-cols-2 gap-4">
                    {image.classification.lighting && (
                      <div>
                        <h3 className="mb-2 text-sm font-semibold text-gray-900">
                          Lighting
                        </h3>
                        <span className="inline-flex items-center rounded-full bg-yellow-100 px-3 py-1 text-sm font-medium text-yellow-800">
                          {image.classification.lighting}
                        </span>
                      </div>
                    )}

                    {image.classification.composition && (
                      <div>
                        <h3 className="mb-2 text-sm font-semibold text-gray-900">
                          Composition
                        </h3>
                        <span className="inline-flex items-center rounded-full bg-green-100 px-3 py-1 text-sm font-medium text-green-800">
                          {image.classification.composition}
                        </span>
                      </div>
                    )}
                  </div>

                  {/* Colors */}
                  {image.classification.colors.length > 0 && (
                    <div>
                      <h3 className="mb-2 flex items-center gap-2 text-sm font-semibold text-gray-900">
                        <Palette className="h-4 w-4" />
                        Dominant Colors
                      </h3>
                      <div className="flex flex-wrap gap-2">
                        {image.classification.colors.map((color) => (
                          <span
                            key={color}
                            className="inline-flex items-center rounded-full bg-gray-100 px-3 py-1 text-sm font-medium text-gray-800"
                          >
                            {color}
                          </span>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* Quality Score */}
                  {image.classification.quality_score && (
                    <div>
                      <h3 className="mb-2 text-sm font-semibold text-gray-900">
                        Quality Score
                      </h3>
                      <div className="flex items-center gap-2">
                        <div className="h-2 flex-1 rounded-full bg-gray-200">
                          <div
                            className="h-2 rounded-full bg-primary transition-all"
                            style={{
                              width: `${image.classification.quality_score * 10}%`,
                            }}
                          />
                        </div>
                        <span className="text-sm font-medium text-gray-900">
                          {image.classification.quality_score.toFixed(1)}/10
                        </span>
                      </div>
                    </div>
                  )}
                </div>
              )}

              {activeTab === "use-cases" && (
                <div className="space-y-4">
                  {/* Best Use Cases */}
                  {image.classification.best_use_cases &&
                    image.classification.best_use_cases.length > 0 && (
                      <div>
                        <h3 className="mb-3 flex items-center gap-2 text-sm font-semibold text-gray-900">
                          <CheckCircle2 className="h-5 w-5 text-green-600" />
                          Perfect For
                        </h3>
                        <div className="space-y-2">
                          {image.classification.best_use_cases.map(
                            (useCase, idx) => (
                              <div
                                key={idx}
                                className="flex items-start gap-2 rounded-lg border border-green-200 bg-green-50 p-3"
                              >
                                <CheckCircle2 className="mt-0.5 h-4 w-4 flex-shrink-0 text-green-600" />
                                <span className="text-sm text-green-900">
                                  {useCase}
                                </span>
                              </div>
                            )
                          )}
                        </div>
                      </div>
                    )}

                  {/* Not Recommended For */}
                  {image.classification.not_recommended_for &&
                    image.classification.not_recommended_for.length > 0 && (
                      <div>
                        <h3 className="mb-3 flex items-center gap-2 text-sm font-semibold text-gray-900">
                          <XCircle className="h-5 w-5 text-red-600" />
                          Avoid For
                        </h3>
                        <div className="space-y-2">
                          {image.classification.not_recommended_for.map(
                            (useCase, idx) => (
                              <div
                                key={idx}
                                className="flex items-start gap-2 rounded-lg border border-red-200 bg-red-50 p-3"
                              >
                                <XCircle className="mt-0.5 h-4 w-4 flex-shrink-0 text-red-600" />
                                <span className="text-sm text-red-900">
                                  {useCase}
                                </span>
                              </div>
                            )
                          )}
                        </div>
                      </div>
                    )}

                  {/* Crop Recommendations */}
                  {image.classification.crop_recommendations && (
                    <div>
                      <h3 className="mb-3 flex items-center gap-2 text-sm font-semibold text-gray-900">
                        <Crop className="h-5 w-5" />
                        Crop Viability
                      </h3>
                      <div className="space-y-3">
                        {image.classification.crop_recommendations.square !==
                          null && (
                          <div>
                            <div className="mb-1 flex items-center justify-between">
                              <span className="text-sm text-gray-600">
                                Square (1:1) - Instagram Feed
                              </span>
                              <span className="text-sm font-medium text-gray-900">
                                {image.classification.crop_recommendations.square.toFixed(
                                  1
                                )}
                                /10
                              </span>
                            </div>
                            <div className="h-2 w-full rounded-full bg-gray-200">
                              <div
                                className={`h-2 rounded-full transition-all ${
                                  image.classification.crop_recommendations
                                    .square >= 8
                                    ? "bg-green-500"
                                    : image.classification.crop_recommendations
                                          .square >= 6
                                      ? "bg-yellow-500"
                                      : "bg-red-500"
                                }`}
                                style={{
                                  width: `${image.classification.crop_recommendations.square * 10}%`,
                                }}
                              />
                            </div>
                          </div>
                        )}

                        {image.classification.crop_recommendations.portrait !==
                          null && (
                          <div>
                            <div className="mb-1 flex items-center justify-between">
                              <span className="text-sm text-gray-600">
                                Portrait (4:5, 9:16) - Stories
                              </span>
                              <span className="text-sm font-medium text-gray-900">
                                {image.classification.crop_recommendations.portrait.toFixed(
                                  1
                                )}
                                /10
                              </span>
                            </div>
                            <div className="h-2 w-full rounded-full bg-gray-200">
                              <div
                                className={`h-2 rounded-full transition-all ${
                                  image.classification.crop_recommendations
                                    .portrait >= 8
                                    ? "bg-green-500"
                                    : image.classification.crop_recommendations
                                          .portrait >= 6
                                      ? "bg-yellow-500"
                                      : "bg-red-500"
                                }`}
                                style={{
                                  width: `${image.classification.crop_recommendations.portrait * 10}%`,
                                }}
                              />
                            </div>
                          </div>
                        )}

                        {image.classification.crop_recommendations.landscape !==
                          null && (
                          <div>
                            <div className="mb-1 flex items-center justify-between">
                              <span className="text-sm text-gray-600">
                                Landscape (16:9) - Website Hero
                              </span>
                              <span className="text-sm font-medium text-gray-900">
                                {image.classification.crop_recommendations.landscape.toFixed(
                                  1
                                )}
                                /10
                              </span>
                            </div>
                            <div className="h-2 w-full rounded-full bg-gray-200">
                              <div
                                className={`h-2 rounded-full transition-all ${
                                  image.classification.crop_recommendations
                                    .landscape >= 8
                                    ? "bg-green-500"
                                    : image.classification.crop_recommendations
                                          .landscape >= 6
                                      ? "bg-yellow-500"
                                      : "bg-red-500"
                                }`}
                                style={{
                                  width: `${image.classification.crop_recommendations.landscape * 10}%`,
                                }}
                              />
                            </div>
                          </div>
                        )}
                      </div>
                    </div>
                  )}

                  {/* Technical Notes */}
                  {image.classification.technical_notes && (
                    <div className="rounded-lg border border-blue-200 bg-blue-50 p-4">
                      <h3 className="mb-2 text-sm font-semibold text-blue-900">
                        Technical Notes
                      </h3>
                      <p className="text-sm text-blue-800">
                        {image.classification.technical_notes}
                      </p>
                    </div>
                  )}
                </div>
              )}

              {activeTab === "metadata" && (
                <div className="space-y-4">
                  <div className="grid grid-cols-2 gap-4 text-sm">
                    <div>
                      <p className="text-gray-500">File Name</p>
                      <p className="truncate font-medium text-gray-900">
                        {image.fileName}
                      </p>
                    </div>
                    <div>
                      <p className="text-gray-500">File Size</p>
                      <p className="font-medium text-gray-900">
                        {formatFileSize(image.fileSize)}
                      </p>
                    </div>
                    <div>
                      <p className="text-gray-500">Dimensions</p>
                      <p className="font-medium text-gray-900">
                        {image.width} × {image.height}
                      </p>
                    </div>
                    <div>
                      <p className="text-gray-500">Aspect Ratio</p>
                      <p className="font-medium text-gray-900">
                        {formatAspectRatioFromDecimal(
                          parseFloat(image.aspectRatio)
                        )}
                      </p>
                    </div>
                    <div>
                      <p className="text-gray-500">Orientation</p>
                      <p className="font-medium text-gray-900">
                        {image.orientation}
                      </p>
                    </div>
                    <div>
                      <p className="text-gray-500">MIME Type</p>
                      <p className="font-medium text-gray-900">
                        {image.mimeType}
                      </p>
                    </div>
                  </div>

                  <div className="border-t border-gray-200 pt-4">
                    <p className="mb-1 text-sm text-gray-500">Uploaded</p>
                    <p className="text-sm font-medium text-gray-900">
                      {formatDate(image.createdAt)}
                    </p>
                  </div>

                  {image.userTags.length > 0 && (
                    <div>
                      <h3 className="mb-2 flex items-center gap-2 text-sm font-semibold text-gray-900">
                        <Tag className="h-4 w-4" />
                        Tags
                      </h3>
                      <div className="flex flex-wrap gap-2">
                        {image.userTags.map((tag) => (
                          <span
                            key={tag}
                            className="inline-flex items-center rounded-full bg-gray-100 px-3 py-1 text-sm font-medium text-gray-800"
                          >
                            {tag}
                          </span>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              )}

              {activeTab === "actions" && (
                <div className="space-y-4">
                  {/* Rating */}
                  <div>
                    <h3 className="mb-2 text-sm font-semibold text-gray-900">
                      Your Rating
                    </h3>
                    <div className="flex gap-1">
                      {[1, 2, 3, 4, 5].map((star) => (
                        <button
                          key={star}
                          onClick={() => setUserRating(star)}
                          className="p-1 transition-transform hover:scale-110"
                        >
                          <Star
                            className={`h-6 w-6 ${
                              star <= userRating
                                ? "fill-yellow-400 text-yellow-400"
                                : "text-gray-300"
                            }`}
                          />
                        </button>
                      ))}
                    </div>
                  </div>

                  {/* Platform Scores */}
                  <div>
                    <h3 className="mb-3 text-sm font-semibold text-gray-900">
                      Platform Suitability
                    </h3>
                    <div className="space-y-3">
                      {Object.entries(image.platformScores).map(
                        ([platform, score]) => {
                          if (!score) return null;
                          return (
                            <div key={platform}>
                              <div className="mb-1 flex items-center justify-between">
                                <span className="text-sm capitalize text-gray-600">
                                  {platform}
                                </span>
                                <span className="text-sm font-medium text-gray-900">
                                  {score.toFixed(1)}/10
                                </span>
                              </div>
                              <div className="h-2 w-full rounded-full bg-gray-200">
                                <div
                                  className={`h-2 rounded-full transition-all ${
                                    score >= 8
                                      ? "bg-green-500"
                                      : score >= 6
                                        ? "bg-yellow-500"
                                        : "bg-red-500"
                                  }`}
                                  style={{ width: `${score * 10}%` }}
                                />
                              </div>
                            </div>
                          );
                        }
                      )}
                    </div>
                  </div>

                  {/* Actions */}
                  <div className="border-t border-gray-200 pt-4">
                    <button className="flex w-full items-center justify-center gap-2 rounded-lg bg-primary px-4 py-2 text-sm font-medium text-white transition-colors hover:bg-primary/90">
                      <Download className="h-4 w-4" />
                      Download Original
                    </button>
                  </div>
                </div>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
