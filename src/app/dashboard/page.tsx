"use client";

import { useEffect, useState } from "react";
import Image from "next/image";
import Link from "next/link";
import ImageDetailModal from "@/components/ImageDetailModal";

interface ImageData {
  id: string;
  fileName: string;
  fileSize: number;
  mimeType: string;
  width: number;
  height: number;
  url: string;
  thumbnailUrl: string | null;
  aspectRatio: string;
  orientation: string;
  classification: any;
  createdAt: string;
}

export default function DashboardPage() {
  const [images, setImages] = useState<ImageData[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState("");
  const [selectedImage, setSelectedImage] = useState<ImageData | null>(null);

  useEffect(() => {
    async function fetchImages() {
      try {
        const response = await fetch("/api/images");
        if (!response.ok) throw new Error("Failed to fetch images");
        const data = await response.json();
        setImages(data);
      } catch (err) {
        setError(err instanceof Error ? err.message : "Failed to load images");
      } finally {
        setIsLoading(false);
      }
    }

    fetchImages();
  }, []);

  if (isLoading) {
    return (
      <div className="px-4 py-6 sm:px-0">
        <div className="text-center">
          <p className="text-gray-600">Loading images...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="px-4 py-6 sm:px-0">
        <div className="rounded-md bg-red-50 p-4">
          <p className="text-sm text-red-800">{error}</p>
        </div>
      </div>
    );
  }

  if (images.length === 0) {
    return (
      <div className="px-4 py-6 sm:px-0">
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
    <div className="px-4 py-6 sm:px-0">
      <div className="mb-6 flex items-center justify-between">
        <h2 className="text-2xl font-bold text-gray-900">Gallery</h2>
        <Link
          href="/dashboard/upload"
          className="inline-flex items-center rounded-md border border-transparent bg-primary px-4 py-2 text-sm font-medium text-white shadow-sm hover:bg-primary/90"
        >
          Upload Images
        </Link>
      </div>

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4">
        {images.map((image) => (
          <div
            key={image.id}
            onClick={() => setSelectedImage(image)}
            className="group relative cursor-pointer overflow-hidden rounded-lg bg-white shadow transition-shadow hover:shadow-lg"
          >
            <div className="relative aspect-square bg-gray-100">
              {image.thumbnailUrl ? (
                <Image
                  src={image.thumbnailUrl}
                  alt={image.fileName}
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
            </div>
            <div className="p-3">
              <p className="truncate text-sm font-medium text-gray-900">
                {image.fileName}
              </p>
              <p className="text-xs text-gray-500">
                {image.width} × {image.height}
              </p>
              {image.classification && (
                <div className="mt-2 flex flex-wrap gap-1">
                  {image.classification.primary_subject && (
                    <span className="inline-flex items-center rounded bg-blue-100 px-2 py-0.5 text-xs font-medium text-blue-800">
                      {image.classification.primary_subject}
                    </span>
                  )}
                  {image.classification.style && (
                    <span className="inline-flex items-center rounded bg-purple-100 px-2 py-0.5 text-xs font-medium text-purple-800">
                      {image.classification.style}
                    </span>
                  )}
                </div>
              )}
            </div>
          </div>
        ))}
      </div>

      {selectedImage && (
        <ImageDetailModal
          image={selectedImage}
          onClose={() => setSelectedImage(null)}
        />
      )}
    </div>
  );
}
