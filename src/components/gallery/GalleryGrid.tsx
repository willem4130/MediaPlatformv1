"use client";

import { useEffect, useRef, useState } from "react";
import Image from "next/image";
import { useGalleryStore } from "@/stores/gallery-store";
import { Star, Check, Sparkles, Trash2 } from "lucide-react";

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

interface GalleryGridProps {
  images: ImageData[];
  isLoading?: boolean;
}

export function GalleryGrid({ images, isLoading }: GalleryGridProps) {
  const {
    viewMode,
    gridColumns,
    selectedImages,
    isMultiSelectMode,
    openDetail,
    toggleImageSelection,
  } = useGalleryStore();

  const gridRef = useRef<HTMLDivElement>(null);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [analysisProgress, setAnalysisProgress] = useState({
    completed: 0,
    total: 0,
  });
  const [isDeleting, setIsDeleting] = useState(false);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);

  const handleBulkAnalyze = async () => {
    const imageIds = Array.from(selectedImages);
    if (imageIds.length === 0) return;

    setIsAnalyzing(true);
    setAnalysisProgress({ completed: 0, total: imageIds.length });

    try {
      const response = await fetch("/api/images/analyze-batch", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ imageIds }),
      });

      if (!response.ok) {
        throw new Error("Failed to queue AI analysis");
      }

      let completed = 0;
      const pollInterval = setInterval(async () => {
        try {
          const statusResponse = await fetch("/api/images/queue-status", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ imageIds }),
          });

          if (statusResponse.ok) {
            const { jobs } = await statusResponse.json();
            completed = jobs.filter(
              (j: { status: string }) =>
                j.status === "complete" || j.status === "failed"
            ).length;
            setAnalysisProgress({ completed, total: imageIds.length });

            if (completed === imageIds.length) {
              clearInterval(pollInterval);
              setIsAnalyzing(false);
              setTimeout(() => window.location.reload(), 500);
            }
          }
        } catch (error) {
          console.error("Status poll error:", error);
        }
      }, 1000);

      setTimeout(() => {
        clearInterval(pollInterval);
        setIsAnalyzing(false);
        window.location.reload();
      }, 60000);
    } catch (error) {
      console.error("Bulk analyze error:", error);
      alert("Failed to queue AI analysis. Please try again.");
      setIsAnalyzing(false);
    }
  };

  const handleBulkDelete = async () => {
    const imageIds = Array.from(selectedImages);
    if (imageIds.length === 0) return;

    setShowDeleteConfirm(false);
    setIsDeleting(true);

    try {
      const response = await fetch("/api/images/delete-batch", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ imageIds }),
      });

      if (!response.ok) {
        throw new Error("Failed to delete images");
      }

      const result = await response.json();
      alert(`Successfully deleted ${result.details.dbRecordsDeleted} image(s)`);

      window.location.reload();
    } catch (error) {
      console.error("Bulk delete error:", error);
      alert("Failed to delete images. Please try again.");
      setIsDeleting(false);
    }
  };

  // Keyboard navigation
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      // Only handle if not typing in an input
      if (
        e.target instanceof HTMLInputElement ||
        e.target instanceof HTMLTextAreaElement
      ) {
        return;
      }

      // Arrow key navigation (if we implement focus)
      // Space to open detail (if an image is focused)
      // etc.
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [images]);

  const handleImageClick = (image: ImageData, e: React.MouseEvent) => {
    if (isMultiSelectMode || e.shiftKey || e.metaKey || e.ctrlKey) {
      toggleImageSelection(image.id);
    } else {
      openDetail(image.id);
    }
  };

  if (isLoading) {
    return (
      <div className="px-4 py-6">
        <div
          className="grid gap-4"
          style={{
            gridTemplateColumns: `repeat(${gridColumns}, minmax(0, 1fr))`,
          }}
        >
          {Array.from({ length: 12 }).map((_, i) => (
            <div
              key={i}
              className="aspect-square animate-pulse rounded-lg bg-gray-200"
            />
          ))}
        </div>
      </div>
    );
  }

  if (images.length === 0) {
    return (
      <div className="px-4 py-12 text-center">
        <svg
          className="mx-auto h-12 w-12 text-gray-400"
          fill="none"
          viewBox="0 0 24 24"
          stroke="currentColor"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z"
          />
        </svg>
        <h3 className="mt-2 text-sm font-medium text-gray-900">
          No images found
        </h3>
        <p className="mt-1 text-sm text-gray-500">
          Try adjusting your search or filters
        </p>
      </div>
    );
  }

  // Render image card component (used in all views)
  const renderImageCard = (image: ImageData, index: number) => {
    const isSelected = selectedImages.has(image.id);
    const shouldShowMetadata = gridColumns <= 8;
    const useFullImage = gridColumns <= 4;
    const imageUrl = useFullImage ? image.url : image.thumbnailUrl || image.url;
    const isPriority = index < gridColumns;

    return (
      <div
        key={image.id}
        onClick={(e) => handleImageClick(image, e)}
        className={`group relative cursor-pointer overflow-hidden rounded-lg bg-white shadow transition-all hover:shadow-xl ${
          isSelected ? "ring-4 ring-primary" : ""
        }`}
      >
        {/* Image */}
        <div
          className={`relative bg-gray-100 ${viewMode === "list" ? "h-48" : "aspect-square"}`}
        >
          {imageUrl ? (
            <Image
              src={imageUrl}
              alt={image.originalName}
              fill
              className="object-cover transition-transform group-hover:scale-105"
              unoptimized
              priority={isPriority}
              sizes={`(max-width: 768px) 50vw, (max-width: 1200px) 33vw, ${100 / gridColumns}vw`}
            />
          ) : (
            <div className="absolute inset-0 flex items-center justify-center">
              <svg
                className="h-12 w-12 text-gray-400"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z"
                />
              </svg>
            </div>
          )}

          {/* Overlay on hover */}
          <div className="absolute inset-0 bg-black/0 transition-colors group-hover:bg-black/20" />

          {/* Selection checkbox */}
          {(isMultiSelectMode || isSelected) && (
            <div className="absolute left-2 top-2 z-10">
              <div
                className={`flex h-6 w-6 items-center justify-center rounded-md transition-colors ${
                  isSelected
                    ? "bg-primary text-white"
                    : "bg-white/80 text-gray-600"
                }`}
              >
                {isSelected && <Check className="h-4 w-4" />}
              </div>
            </div>
          )}

          {/* Pinned badge */}
          {image.isPinned && (
            <div className="absolute right-2 top-2">
              <div className="rounded-full bg-yellow-500 p-1 text-white">
                <Star className="h-4 w-4 fill-current" />
              </div>
            </div>
          )}

          {/* Platform score badges (show on hover) */}
          {shouldShowMetadata && (
            <div className="absolute bottom-2 left-2 right-2 opacity-0 transition-opacity group-hover:opacity-100">
              <div className="flex gap-1 text-xs">
                {image.platformScores.instagram &&
                  image.platformScores.instagram >= 8 && (
                    <span className="rounded-full bg-pink-500 px-2 py-0.5 font-medium text-white">
                      IG {image.platformScores.instagram.toFixed(1)}
                    </span>
                  )}
                {image.platformScores.linkedin &&
                  image.platformScores.linkedin >= 8 && (
                    <span className="rounded-full bg-blue-600 px-2 py-0.5 font-medium text-white">
                      LI {image.platformScores.linkedin.toFixed(1)}
                    </span>
                  )}
              </div>
            </div>
          )}
        </div>

        {/* Image info - only show on larger tiles */}
        {shouldShowMetadata && (
          <div className="p-2">
            <p className="truncate text-sm font-medium text-gray-900">
              {image.originalName}
            </p>
            <p className="text-xs text-gray-500">
              {image.width} × {image.height}
            </p>

            {/* AI Classifications */}
            {gridColumns <= 6 && image.classification.subjects.length > 0 && (
              <div className="mt-2 flex flex-wrap gap-1">
                {image.classification.subjects.slice(0, 2).map((subject) => (
                  <span
                    key={subject}
                    className="inline-flex items-center rounded bg-blue-100 px-2 py-0.5 text-xs font-medium text-blue-800"
                  >
                    {subject}
                  </span>
                ))}
                {image.classification.style && (
                  <span className="inline-flex items-center rounded bg-purple-100 px-2 py-0.5 text-xs font-medium text-purple-800">
                    {image.classification.style}
                  </span>
                )}
              </div>
            )}

            {/* Rating */}
            {gridColumns <= 6 && image.rating && (
              <div className="mt-2 flex items-center gap-1">
                {Array.from({ length: 5 }).map((_, i) => (
                  <Star
                    key={i}
                    className={`h-3 w-3 ${
                      i < image.rating!
                        ? "fill-yellow-400 text-yellow-400"
                        : "text-gray-300"
                    }`}
                  />
                ))}
              </div>
            )}
          </div>
        )}
      </div>
    );
  };

  // Grid view
  if (viewMode === "grid") {
    return (
      <div ref={gridRef} className="px-4 py-6">
        {/* Bulk Action Bar */}
        {selectedImages.size > 0 && (
          <div className="sticky top-0 z-10 mb-4 rounded-lg border border-blue-200 bg-blue-50 p-4 shadow-md">
            <div className="flex items-center justify-between">
              <div className="text-sm font-medium text-blue-900">
                {selectedImages.size} image
                {selectedImages.size !== 1 ? "s" : ""} selected
              </div>
              <div className="flex gap-2">
                <button
                  onClick={() => setShowDeleteConfirm(true)}
                  disabled={isDeleting || isAnalyzing}
                  className="flex items-center gap-2 rounded-lg bg-red-600 px-4 py-2 text-sm font-medium text-white hover:bg-red-700 disabled:cursor-not-allowed disabled:opacity-50"
                >
                  <Trash2 className="h-4 w-4" />
                  {isDeleting ? "Deleting..." : "Delete Selected"}
                </button>
                <button
                  onClick={handleBulkAnalyze}
                  disabled={isAnalyzing || isDeleting}
                  className="flex items-center gap-2 rounded-lg bg-blue-600 px-4 py-2 text-sm font-medium text-white hover:bg-blue-700 disabled:cursor-not-allowed disabled:opacity-50"
                >
                  <Sparkles className="h-4 w-4" />
                  {isAnalyzing
                    ? `Analyzing ${analysisProgress.completed}/${analysisProgress.total}...`
                    : "Analyze Selected"}
                </button>
              </div>
            </div>
            {isAnalyzing && (
              <div className="mt-2">
                <div className="h-2 w-full overflow-hidden rounded-full bg-blue-200">
                  <div
                    className="h-full bg-blue-600 transition-all duration-300"
                    style={{
                      width: `${(analysisProgress.completed / analysisProgress.total) * 100}%`,
                    }}
                  />
                </div>
              </div>
            )}
          </div>
        )}

        {/* Delete Confirmation Modal */}
        {showDeleteConfirm && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50">
            <div className="mx-4 max-w-md rounded-lg bg-white p-6 shadow-xl">
              <h3 className="text-lg font-semibold text-gray-900">
                Delete {selectedImages.size} image
                {selectedImages.size !== 1 ? "s" : ""}?
              </h3>
              <p className="mt-2 text-sm text-gray-600">
                This action cannot be undone. The images and their thumbnails
                will be permanently deleted from the server.
              </p>
              <div className="mt-4 flex justify-end gap-2">
                <button
                  onClick={() => setShowDeleteConfirm(false)}
                  className="rounded-lg border border-gray-300 px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50"
                >
                  Cancel
                </button>
                <button
                  onClick={handleBulkDelete}
                  className="rounded-lg bg-red-600 px-4 py-2 text-sm font-medium text-white hover:bg-red-700"
                >
                  Delete
                </button>
              </div>
            </div>
          </div>
        )}

        <div
          className="grid gap-4"
          style={{
            gridTemplateColumns: `repeat(${gridColumns}, minmax(0, 1fr))`,
          }}
        >
          {images.map((image, index) => renderImageCard(image, index))}
        </div>
      </div>
    );
  }

  // List view
  if (viewMode === "list") {
    return (
      <div ref={gridRef} className="px-4 py-6">
        <div className="flex flex-col gap-4">
          {images.map((image) => {
            const isSelected = selectedImages.has(image.id);

            return (
              <div
                key={image.id}
                onClick={(e) => handleImageClick(image, e)}
                className={`group flex cursor-pointer gap-4 overflow-hidden rounded-lg bg-white p-4 shadow transition-all hover:shadow-xl ${
                  isSelected ? "ring-4 ring-primary" : ""
                }`}
              >
                {/* Thumbnail */}
                <div className="relative h-32 w-32 flex-shrink-0 overflow-hidden rounded-lg bg-gray-100">
                  {image.thumbnailUrl ? (
                    <Image
                      src={image.thumbnailUrl}
                      alt={image.originalName}
                      fill
                      className="object-cover"
                      unoptimized
                    />
                  ) : (
                    <div className="absolute inset-0 flex items-center justify-center">
                      <svg
                        className="h-12 w-12 text-gray-400"
                        fill="none"
                        viewBox="0 0 24 24"
                        stroke="currentColor"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                          d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z"
                        />
                      </svg>
                    </div>
                  )}

                  {/* Selection checkbox */}
                  {(isMultiSelectMode || isSelected) && (
                    <div className="absolute left-2 top-2 z-10">
                      <div
                        className={`flex h-6 w-6 items-center justify-center rounded-md transition-colors ${
                          isSelected
                            ? "bg-primary text-white"
                            : "bg-white/80 text-gray-600"
                        }`}
                      >
                        {isSelected && <Check className="h-4 w-4" />}
                      </div>
                    </div>
                  )}
                </div>

                {/* Details */}
                <div className="flex flex-1 flex-col justify-between">
                  <div>
                    <div className="flex items-start justify-between">
                      <div>
                        <h3 className="font-medium text-gray-900">
                          {image.originalName}
                        </h3>
                        <p className="text-sm text-gray-500">
                          {image.width} × {image.height} •{" "}
                          {(image.fileSize / 1024).toFixed(0)} KB
                        </p>
                      </div>
                      {image.isPinned && (
                        <div className="rounded-full bg-yellow-500 p-1 text-white">
                          <Star className="h-4 w-4 fill-current" />
                        </div>
                      )}
                    </div>

                    {image.classification.description && (
                      <p className="mt-2 line-clamp-2 text-sm text-gray-600">
                        {image.classification.description}
                      </p>
                    )}
                  </div>

                  {/* Tags and scores */}
                  <div className="mt-2 flex flex-wrap gap-2">
                    {image.classification.subjects
                      .slice(0, 3)
                      .map((subject) => (
                        <span
                          key={subject}
                          className="inline-flex items-center rounded bg-blue-100 px-2 py-0.5 text-xs font-medium text-blue-800"
                        >
                          {subject}
                        </span>
                      ))}
                    {image.platformScores.instagram &&
                      image.platformScores.instagram >= 8 && (
                        <span className="rounded-full bg-pink-500 px-2 py-0.5 text-xs font-medium text-white">
                          IG {image.platformScores.instagram.toFixed(1)}
                        </span>
                      )}
                    {image.rating && (
                      <div className="flex items-center gap-1">
                        {Array.from({ length: 5 }).map((_, i) => (
                          <Star
                            key={i}
                            className={`h-3 w-3 ${
                              i < image.rating!
                                ? "fill-yellow-400 text-yellow-400"
                                : "text-gray-300"
                            }`}
                          />
                        ))}
                      </div>
                    )}
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    );
  }

  // Masonry view
  if (viewMode === "masonry") {
    return (
      <div ref={gridRef} className="px-4 py-6">
        <div
          className="gap-4"
          style={{
            columnCount: Math.min(gridColumns, 6),
            columnGap: "1rem",
          }}
        >
          {images.map((image) => {
            const isSelected = selectedImages.has(image.id);

            return (
              <div
                key={image.id}
                onClick={(e) => handleImageClick(image, e)}
                className={`group relative mb-4 inline-block w-full cursor-pointer overflow-hidden rounded-lg bg-white shadow transition-all hover:shadow-xl ${
                  isSelected ? "ring-4 ring-primary" : ""
                }`}
                style={{ breakInside: "avoid" }}
              >
                {/* Image with natural aspect ratio */}
                <div
                  className="relative w-full bg-gray-100"
                  style={{ aspectRatio: `${image.width} / ${image.height}` }}
                >
                  {image.thumbnailUrl ? (
                    <Image
                      src={image.thumbnailUrl}
                      alt={image.originalName}
                      fill
                      className="object-cover transition-transform group-hover:scale-105"
                      unoptimized
                    />
                  ) : (
                    <div className="absolute inset-0 flex items-center justify-center">
                      <svg
                        className="h-12 w-12 text-gray-400"
                        fill="none"
                        viewBox="0 0 24 24"
                        stroke="currentColor"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                          d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z"
                        />
                      </svg>
                    </div>
                  )}

                  {/* Overlay on hover */}
                  <div className="absolute inset-0 bg-black/0 transition-colors group-hover:bg-black/20" />

                  {/* Selection checkbox */}
                  {(isMultiSelectMode || isSelected) && (
                    <div className="absolute left-2 top-2 z-10">
                      <div
                        className={`flex h-6 w-6 items-center justify-center rounded-md transition-colors ${
                          isSelected
                            ? "bg-primary text-white"
                            : "bg-white/80 text-gray-600"
                        }`}
                      >
                        {isSelected && <Check className="h-4 w-4" />}
                      </div>
                    </div>
                  )}

                  {/* Pinned badge */}
                  {image.isPinned && (
                    <div className="absolute right-2 top-2">
                      <div className="rounded-full bg-yellow-500 p-1 text-white">
                        <Star className="h-4 w-4 fill-current" />
                      </div>
                    </div>
                  )}
                </div>

                {/* Image info */}
                <div className="p-3">
                  <p className="truncate text-sm font-medium text-gray-900">
                    {image.originalName}
                  </p>
                  <p className="text-xs text-gray-500">
                    {image.width} × {image.height}
                  </p>

                  {/* AI Classifications */}
                  {image.classification.subjects.length > 0 && (
                    <div className="mt-2 flex flex-wrap gap-1">
                      {image.classification.subjects
                        .slice(0, 2)
                        .map((subject) => (
                          <span
                            key={subject}
                            className="inline-flex items-center rounded bg-blue-100 px-2 py-0.5 text-xs font-medium text-blue-800"
                          >
                            {subject}
                          </span>
                        ))}
                    </div>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      </div>
    );
  }

  return null;
}
