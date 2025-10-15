"use client";

import { useEffect, useState, useMemo } from "react";
import { useGalleryStore } from "@/stores/gallery-store";
import { GalleryToolbar } from "@/components/gallery/GalleryToolbar";
import { GalleryGrid } from "@/components/gallery/GalleryGrid";
import { EnhancedImageDetailModal } from "@/components/gallery/EnhancedImageDetailModal";
import { useKeyboardNavigation } from "@/hooks/useKeyboardNavigation";
import Link from "next/link";

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

export default function DashboardPage() {
  const [allImages, setAllImages] = useState<ImageData[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState("");

  const { filters, sortBy, detailImageId, openDetail, closeDetail } =
    useGalleryStore();

  // Fetch images from API
  useEffect(() => {
    async function fetchImages() {
      try {
        // Build query params
        const params = new URLSearchParams();
        params.append("sortBy", sortBy);
        params.append("limit", "100"); // Fetch more initially

        if (filters.search) params.append("search", filters.search);
        if (filters.subjects.length)
          params.append("subjects", filters.subjects.join(","));
        if (filters.styles.length)
          params.append("styles", filters.styles.join(","));
        if (filters.moods.length)
          params.append("moods", filters.moods.join(","));
        if (filters.lighting.length)
          params.append("lighting", filters.lighting.join(","));
        if (filters.ratings.length)
          params.append("ratings", filters.ratings.join(","));
        if (filters.orientation.length)
          params.append("orientation", filters.orientation.join(","));

        const response = await fetch(`/api/images?${params.toString()}`);
        if (!response.ok) throw new Error("Failed to fetch images");
        const data = await response.json();
        setAllImages(data.images || []);
      } catch (err) {
        setError(err instanceof Error ? err.message : "Failed to load images");
      } finally {
        setIsLoading(false);
      }
    }

    fetchImages();
  }, [filters, sortBy]);

  // Setup keyboard navigation
  useKeyboardNavigation({
    images: allImages,
    onRateImage: (imageId, rating) => {
      console.log("Rate image:", imageId, rating);
      // TODO: Implement rating API call
    },
    onToggleFavorite: (imageId) => {
      console.log("Toggle favorite:", imageId);
      // TODO: Implement favorite API call
    },
  });

  // Get current detail image
  const detailImage = useMemo(() => {
    if (!detailImageId) return null;
    return allImages.find((img) => img.id === detailImageId) || null;
  }, [detailImageId, allImages]);

  // Navigate in detail modal
  const handleDetailNavigate = (direction: "prev" | "next") => {
    if (!detailImageId) return;
    const currentIndex = allImages.findIndex((img) => img.id === detailImageId);
    if (currentIndex === -1) return;

    if (direction === "prev" && currentIndex > 0) {
      openDetail(allImages[currentIndex - 1].id);
    } else if (direction === "next" && currentIndex < allImages.length - 1) {
      openDetail(allImages[currentIndex + 1].id);
    }
  };

  if (error) {
    return (
      <div className="flex flex-1 items-center justify-center p-6">
        <div className="max-w-md rounded-md bg-red-50 p-4">
          <p className="text-sm text-red-800">{error}</p>
        </div>
      </div>
    );
  }

  if (!isLoading && allImages.length === 0 && !filters.search) {
    return (
      <div className="flex flex-1 items-center justify-center p-6">
        <div className="text-center">
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
          <h3 className="mt-2 text-sm font-medium text-gray-900">No images</h3>
          <p className="mt-1 text-sm text-gray-500">
            Get started by uploading some images.
          </p>
          <div className="mt-6">
            <Link
              href="/dashboard/upload"
              className="inline-flex items-center rounded-md border border-transparent bg-primary px-4 py-2 text-sm font-medium text-white shadow-sm hover:bg-primary/90"
            >
              Upload Images
            </Link>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="flex h-full flex-col">
      <GalleryToolbar />
      <div className="flex-1 overflow-y-auto">
        <GalleryGrid images={allImages} isLoading={isLoading} />
      </div>

      {detailImage && (
        <EnhancedImageDetailModal
          image={detailImage}
          images={allImages}
          onClose={closeDetail}
          onNavigate={handleDetailNavigate}
        />
      )}
    </div>
  );
}
