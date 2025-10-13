"use client";

import { useState, useCallback } from "react";
import { useRouter } from "next/navigation";
import { useDropzone } from "react-dropzone";

interface UploadProgress {
  fileName: string;
  status: "uploading" | "processing" | "complete" | "error";
  error?: string;
}

export default function UploadPage() {
  const router = useRouter();
  const [uploads, setUploads] = useState<UploadProgress[]>([]);
  const [isUploading, setIsUploading] = useState(false);

  const onDrop = useCallback(async (acceptedFiles: File[]) => {
    if (acceptedFiles.length === 0) return;

    setIsUploading(true);
    const newUploads: UploadProgress[] = acceptedFiles.map((file) => ({
      fileName: file.name,
      status: "uploading",
    }));
    setUploads(newUploads);

    const formData = new FormData();
    acceptedFiles.forEach((file) => {
      formData.append("files", file);
    });

    try {
      const response = await fetch("/api/upload", {
        method: "POST",
        body: formData,
      });

      if (!response.ok) {
        throw new Error("Upload failed");
      }

      const result = await response.json();

      setUploads((prev) =>
        prev.map((upload) => ({
          ...upload,
          status: "processing",
        }))
      );

      setTimeout(() => {
        setUploads((prev) =>
          prev.map((upload) => ({
            ...upload,
            status: "complete",
          }))
        );
        setIsUploading(false);

        setTimeout(() => {
          router.push("/dashboard");
        }, 1500);
      }, 2000);
    } catch (error) {
      setUploads((prev) =>
        prev.map((upload) => ({
          ...upload,
          status: "error",
          error: error instanceof Error ? error.message : "Upload failed",
        }))
      );
      setIsUploading(false);
    }
  }, [router]);

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: {
      "image/*": [".png", ".jpg", ".jpeg", ".gif", ".webp"],
    },
    maxSize: 25 * 1024 * 1024,
    maxFiles: 50,
    disabled: isUploading,
  });

  return (
    <div className="px-4 py-6 sm:px-0">
      <div className="mb-6">
        <h2 className="text-2xl font-bold text-gray-900">Upload Images</h2>
        <p className="mt-1 text-sm text-gray-600">
          Upload up to 50 images at once. Maximum file size: 25MB per image.
        </p>
      </div>

      <div
        {...getRootProps()}
        className={`mt-6 border-2 border-dashed rounded-lg p-12 text-center cursor-pointer transition-colors ${
          isDragActive
            ? "border-primary bg-primary/5"
            : "border-gray-300 hover:border-gray-400"
        } ${isUploading ? "opacity-50 cursor-not-allowed" : ""}`}
      >
        <input {...getInputProps()} />
        <svg
          className="mx-auto h-12 w-12 text-gray-400"
          stroke="currentColor"
          fill="none"
          viewBox="0 0 48 48"
        >
          <path
            d="M28 8H12a4 4 0 00-4 4v20m32-12v8m0 0v8a4 4 0 01-4 4H12a4 4 0 01-4-4v-4m32-4l-3.172-3.172a4 4 0 00-5.656 0L28 28M8 32l9.172-9.172a4 4 0 015.656 0L28 28m0 0l4 4m4-24h8m-4-4v8m-12 4h.02"
            strokeWidth={2}
            strokeLinecap="round"
            strokeLinejoin="round"
          />
        </svg>
        <p className="mt-2 text-sm text-gray-600">
          {isDragActive ? (
            "Drop the files here..."
          ) : (
            <>
              <span className="font-medium text-primary">Click to upload</span> or drag and drop
            </>
          )}
        </p>
        <p className="mt-1 text-xs text-gray-500">PNG, JPG, GIF, WebP up to 25MB each</p>
      </div>

      {uploads.length > 0 && (
        <div className="mt-8">
          <h3 className="text-lg font-medium text-gray-900 mb-4">Upload Progress</h3>
          <div className="space-y-3">
            {uploads.map((upload, index) => (
              <div key={index} className="bg-white rounded-lg shadow p-4">
                <div className="flex items-center justify-between">
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-gray-900 truncate">
                      {upload.fileName}
                    </p>
                    <p className="text-xs text-gray-500 mt-1">
                      {upload.status === "uploading" && "Uploading..."}
                      {upload.status === "processing" && "Processing with AI..."}
                      {upload.status === "complete" && "Complete"}
                      {upload.status === "error" && `Error: ${upload.error}`}
                    </p>
                  </div>
                  <div className="ml-4">
                    {upload.status === "uploading" && (
                      <div className="h-5 w-5 border-2 border-primary border-t-transparent rounded-full animate-spin" />
                    )}
                    {upload.status === "processing" && (
                      <div className="h-5 w-5 border-2 border-purple-500 border-t-transparent rounded-full animate-spin" />
                    )}
                    {upload.status === "complete" && (
                      <svg className="h-5 w-5 text-green-500" fill="currentColor" viewBox="0 0 20 20">
                        <path
                          fillRule="evenodd"
                          d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z"
                          clipRule="evenodd"
                        />
                      </svg>
                    )}
                    {upload.status === "error" && (
                      <svg className="h-5 w-5 text-red-500" fill="currentColor" viewBox="0 0 20 20">
                        <path
                          fillRule="evenodd"
                          d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z"
                          clipRule="evenodd"
                        />
                      </svg>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
