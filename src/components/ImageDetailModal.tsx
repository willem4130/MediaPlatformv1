"use client";

import { useEffect } from "react";
import Image from "next/image";

interface Classification {
  primary_subject?: string;
  secondary_subjects?: string[];
  style?: string;
  mood?: string;
  lighting?: string;
  composition?: string;
  dominant_colors?: string[];
  platform_scores?: {
    instagram?: number;
    facebook?: number;
    linkedin?: number;
    website?: number;
    print?: number;
  };
}

interface ImageDetail {
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
  classification: Classification | null;
  createdAt: string;
}

interface ImageDetailModalProps {
  image: ImageDetail;
  onClose: () => void;
}

export default function ImageDetailModal({
  image,
  onClose,
}: ImageDetailModalProps) {
  useEffect(() => {
    function handleEscape(e: KeyboardEvent) {
      if (e.key === "Escape") {
        onClose();
      }
    }

    document.addEventListener("keydown", handleEscape);
    document.body.style.overflow = "hidden";

    return () => {
      document.removeEventListener("keydown", handleEscape);
      document.body.style.overflow = "unset";
    };
  }, [onClose]);

  function formatFileSize(bytes: number): string {
    if (bytes < 1024) return bytes + " B";
    if (bytes < 1024 * 1024) return (bytes / 1024).toFixed(1) + " KB";
    return (bytes / (1024 * 1024)).toFixed(1) + " MB";
  }

  function getPlatformScoreColor(score: number): string {
    if (score >= 80) return "text-green-600";
    if (score >= 60) return "text-yellow-600";
    return "text-red-600";
  }

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto">
      <div className="flex min-h-screen items-center justify-center px-4 pb-20 pt-4 text-center sm:block sm:p-0">
        <div
          className="fixed inset-0 bg-gray-500 bg-opacity-75 transition-opacity"
          onClick={onClose}
        />

        <div className="inline-block transform overflow-hidden rounded-lg bg-white text-left align-bottom shadow-xl transition-all sm:my-8 sm:w-full sm:max-w-4xl sm:align-middle">
          <div className="absolute right-0 top-0 pr-4 pt-4">
            <button
              onClick={onClose}
              className="rounded-md bg-white text-gray-400 hover:text-gray-500 focus:outline-none"
            >
              <span className="sr-only">Close</span>
              <svg
                className="h-6 w-6"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M6 18L18 6M6 6l12 12"
                />
              </svg>
            </button>
          </div>

          <div className="bg-white px-4 pb-4 pt-5 sm:p-6 sm:pb-4">
            <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
              <div className="relative aspect-square overflow-hidden rounded-lg bg-gray-100">
                <Image
                  src={image.url}
                  alt={image.fileName}
                  fill
                  className="object-contain"
                  unoptimized
                />
              </div>

              <div className="space-y-6">
                <div>
                  <h3 className="mb-4 text-lg font-medium text-gray-900">
                    Image Details
                  </h3>
                  <dl className="space-y-2">
                    <div>
                      <dt className="text-xs font-medium text-gray-500">
                        File Name
                      </dt>
                      <dd className="break-all text-sm text-gray-900">
                        {image.fileName}
                      </dd>
                    </div>
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <dt className="text-xs font-medium text-gray-500">
                          Dimensions
                        </dt>
                        <dd className="text-sm text-gray-900">
                          {image.width} × {image.height}
                        </dd>
                      </div>
                      <div>
                        <dt className="text-xs font-medium text-gray-500">
                          File Size
                        </dt>
                        <dd className="text-sm text-gray-900">
                          {formatFileSize(image.fileSize)}
                        </dd>
                      </div>
                    </div>
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <dt className="text-xs font-medium text-gray-500">
                          Aspect Ratio
                        </dt>
                        <dd className="text-sm text-gray-900">
                          {image.aspectRatio}
                        </dd>
                      </div>
                      <div>
                        <dt className="text-xs font-medium text-gray-500">
                          Orientation
                        </dt>
                        <dd className="text-sm capitalize text-gray-900">
                          {image.orientation}
                        </dd>
                      </div>
                    </div>
                  </dl>
                </div>

                {image.classification && (
                  <>
                    <div>
                      <h3 className="mb-4 text-lg font-medium text-gray-900">
                        AI Classification
                      </h3>
                      <dl className="space-y-3">
                        {image.classification.primary_subject && (
                          <div>
                            <dt className="text-xs font-medium text-gray-500">
                              Primary Subject
                            </dt>
                            <dd className="mt-1">
                              <span className="inline-flex items-center rounded-full bg-blue-100 px-3 py-1 text-sm font-medium text-blue-800">
                                {image.classification.primary_subject}
                              </span>
                            </dd>
                          </div>
                        )}
                        {image.classification.secondary_subjects &&
                          image.classification.secondary_subjects.length >
                            0 && (
                            <div>
                              <dt className="text-xs font-medium text-gray-500">
                                Secondary Subjects
                              </dt>
                              <dd className="mt-1 flex flex-wrap gap-2">
                                {image.classification.secondary_subjects.map(
                                  (subject, idx) => (
                                    <span
                                      key={idx}
                                      className="inline-flex items-center rounded-full bg-gray-100 px-2 py-1 text-xs font-medium text-gray-800"
                                    >
                                      {subject}
                                    </span>
                                  )
                                )}
                              </dd>
                            </div>
                          )}
                        <div className="grid grid-cols-2 gap-4">
                          {image.classification.style && (
                            <div>
                              <dt className="text-xs font-medium text-gray-500">
                                Style
                              </dt>
                              <dd className="text-sm text-gray-900">
                                {image.classification.style}
                              </dd>
                            </div>
                          )}
                          {image.classification.mood && (
                            <div>
                              <dt className="text-xs font-medium text-gray-500">
                                Mood
                              </dt>
                              <dd className="text-sm text-gray-900">
                                {image.classification.mood}
                              </dd>
                            </div>
                          )}
                        </div>
                        <div className="grid grid-cols-2 gap-4">
                          {image.classification.lighting && (
                            <div>
                              <dt className="text-xs font-medium text-gray-500">
                                Lighting
                              </dt>
                              <dd className="text-sm text-gray-900">
                                {image.classification.lighting}
                              </dd>
                            </div>
                          )}
                          {image.classification.composition && (
                            <div>
                              <dt className="text-xs font-medium text-gray-500">
                                Composition
                              </dt>
                              <dd className="text-sm text-gray-900">
                                {image.classification.composition}
                              </dd>
                            </div>
                          )}
                        </div>
                        {image.classification.dominant_colors &&
                          image.classification.dominant_colors.length > 0 && (
                            <div>
                              <dt className="text-xs font-medium text-gray-500">
                                Dominant Colors
                              </dt>
                              <dd className="mt-1 flex flex-wrap gap-2">
                                {image.classification.dominant_colors.map(
                                  (color, idx) => (
                                    <span
                                      key={idx}
                                      className="inline-flex items-center rounded-full bg-purple-100 px-2 py-1 text-xs font-medium text-purple-800"
                                    >
                                      {color}
                                    </span>
                                  )
                                )}
                              </dd>
                            </div>
                          )}
                      </dl>
                    </div>

                    {image.classification.platform_scores && (
                      <div>
                        <h3 className="mb-4 text-lg font-medium text-gray-900">
                          Platform Suitability
                        </h3>
                        <div className="space-y-3">
                          {Object.entries(
                            image.classification.platform_scores
                          ).map(([platform, score]) => (
                            <div key={platform}>
                              <div className="mb-1 flex items-center justify-between">
                                <span className="text-sm font-medium capitalize text-gray-700">
                                  {platform}
                                </span>
                                <span
                                  className={`text-sm font-bold ${getPlatformScoreColor(score)}`}
                                >
                                  {score}%
                                </span>
                              </div>
                              <div className="h-2 w-full rounded-full bg-gray-200">
                                <div
                                  className={`h-2 rounded-full ${
                                    score >= 80
                                      ? "bg-green-500"
                                      : score >= 60
                                        ? "bg-yellow-500"
                                        : "bg-red-500"
                                  }`}
                                  style={{ width: `${score}%` }}
                                />
                              </div>
                            </div>
                          ))}
                        </div>
                      </div>
                    )}
                  </>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
