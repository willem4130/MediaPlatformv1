import { useEffect } from "react";
import { useGalleryStore } from "@/stores/gallery-store";

interface KeyboardNavigationOptions {
  images: any[];
  onRateImage?: (imageId: string, rating: number) => void;
  onToggleFavorite?: (imageId: string) => void;
}

export function useKeyboardNavigation({
  images,
  onRateImage,
  onToggleFavorite,
}: KeyboardNavigationOptions) {
  const {
    detailImageId,
    openDetail,
    closeDetail,
    setMultiSelectMode,
    isMultiSelectMode,
  } = useGalleryStore();

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      // Don't handle if typing in an input/textarea
      if (
        e.target instanceof HTMLInputElement ||
        e.target instanceof HTMLTextAreaElement
      ) {
        return;
      }

      // ESC - Close detail modal or exit multi-select
      if (e.key === "Escape") {
        if (detailImageId) {
          closeDetail();
        } else if (isMultiSelectMode) {
          setMultiSelectMode(false);
        }
        return;
      }

      // If detail modal is open
      if (detailImageId && images.length > 0) {
        const currentIndex = images.findIndex(
          (img) => img.id === detailImageId
        );

        // Arrow keys - Navigate between images
        if (e.key === "ArrowLeft" && currentIndex > 0) {
          e.preventDefault();
          openDetail(images[currentIndex - 1].id);
          return;
        }

        if (e.key === "ArrowRight" && currentIndex < images.length - 1) {
          e.preventDefault();
          openDetail(images[currentIndex + 1].id);
          return;
        }

        // Number keys 1-5 - Quick rating
        if (["1", "2", "3", "4", "5"].includes(e.key) && onRateImage) {
          e.preventDefault();
          const rating = parseInt(e.key);
          onRateImage(detailImageId, rating);
          return;
        }

        // F key - Toggle favorite
        if (e.key === "f" && onToggleFavorite) {
          e.preventDefault();
          onToggleFavorite(detailImageId);
          return;
        }
      }

      // Slash - Focus search (handled by toolbar component)
      if (e.key === "/") {
        e.preventDefault();
        const searchInput = document.querySelector(
          'input[type="text"][placeholder*="Search"]'
        ) as HTMLInputElement;
        if (searchInput) {
          searchInput.focus();
        }
        return;
      }

      // M key - Toggle multi-select mode
      if (e.key === "m" && !detailImageId) {
        e.preventDefault();
        setMultiSelectMode(!isMultiSelectMode);
        return;
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [
    images,
    detailImageId,
    isMultiSelectMode,
    openDetail,
    closeDetail,
    setMultiSelectMode,
    onRateImage,
    onToggleFavorite,
  ]);
}
