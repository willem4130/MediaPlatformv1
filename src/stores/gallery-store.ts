import { create } from "zustand";

export type ViewMode = "grid" | "masonry" | "list";
export type SortOption =
  | "date-desc"
  | "date-asc"
  | "rating-desc"
  | "rating-asc"
  | "name-asc"
  | "name-desc";

export interface GalleryFilters {
  search: string;
  subjects: string[];
  styles: string[];
  moods: string[];
  lighting: string[];
  ratings: number[];
  orientation: string[];
  platformScores?: {
    instagram?: [number, number];
    facebook?: [number, number];
    linkedin?: [number, number];
    websiteHero?: [number, number];
  };
}

interface GalleryState {
  // View state
  viewMode: ViewMode;
  sortBy: SortOption;
  gridColumns: number;

  // Filters
  filters: GalleryFilters;
  activeFilterCount: number;

  // Selection
  selectedImages: Set<string>;
  isMultiSelectMode: boolean;

  // Detail modal
  detailImageId: string | null;

  // Actions
  setViewMode: (mode: ViewMode) => void;
  setSortBy: (sort: SortOption) => void;
  setGridColumns: (columns: number) => void;

  setSearch: (search: string) => void;
  setFilter: <K extends keyof GalleryFilters>(
    key: K,
    value: GalleryFilters[K]
  ) => void;
  addFilterValue: (key: keyof GalleryFilters, value: string | number) => void;
  removeFilterValue: (
    key: keyof GalleryFilters,
    value: string | number
  ) => void;
  clearFilters: () => void;

  toggleImageSelection: (id: string) => void;
  selectImages: (ids: string[]) => void;
  clearSelection: () => void;
  setMultiSelectMode: (enabled: boolean) => void;

  openDetail: (id: string) => void;
  closeDetail: () => void;
}

const defaultFilters: GalleryFilters = {
  search: "",
  subjects: [],
  styles: [],
  moods: [],
  lighting: [],
  ratings: [],
  orientation: [],
};

const calculateActiveFilters = (filters: GalleryFilters): number => {
  let count = 0;
  if (filters.search) count++;
  if (filters.subjects.length > 0) count++;
  if (filters.styles.length > 0) count++;
  if (filters.moods.length > 0) count++;
  if (filters.lighting.length > 0) count++;
  if (filters.ratings.length > 0) count++;
  if (filters.orientation.length > 0) count++;
  if (filters.platformScores) {
    const scores = filters.platformScores;
    if (scores.instagram) count++;
    if (scores.facebook) count++;
    if (scores.linkedin) count++;
    if (scores.websiteHero) count++;
  }
  return count;
};

export const useGalleryStore = create<GalleryState>((set, get) => ({
  // Initial state
  viewMode: "grid",
  sortBy: "date-desc",
  gridColumns: 6,
  filters: defaultFilters,
  activeFilterCount: 0,
  selectedImages: new Set(),
  isMultiSelectMode: false,
  detailImageId: null,

  // View actions
  setViewMode: (mode) => set({ viewMode: mode }),
  setSortBy: (sort) => set({ sortBy: sort }),
  setGridColumns: (columns) => set({ gridColumns: columns }),

  // Filter actions
  setSearch: (search) =>
    set((state) => {
      const newFilters = { ...state.filters, search };
      return {
        filters: newFilters,
        activeFilterCount: calculateActiveFilters(newFilters),
      };
    }),

  setFilter: (key, value) =>
    set((state) => {
      const newFilters = { ...state.filters, [key]: value };
      return {
        filters: newFilters,
        activeFilterCount: calculateActiveFilters(newFilters),
      };
    }),

  addFilterValue: (key, value) =>
    set((state) => {
      const currentValues = state.filters[key];
      if (
        Array.isArray(currentValues) &&
        !currentValues.includes(value as never)
      ) {
        const newFilters = {
          ...state.filters,
          [key]: [...currentValues, value as never],
        };
        return {
          filters: newFilters,
          activeFilterCount: calculateActiveFilters(newFilters),
        };
      }
      return state;
    }),

  removeFilterValue: (key, value) =>
    set((state) => {
      const currentValues = state.filters[key];
      if (Array.isArray(currentValues)) {
        const newFilters = {
          ...state.filters,
          [key]: currentValues.filter((v) => v !== value) as never,
        };
        return {
          filters: newFilters,
          activeFilterCount: calculateActiveFilters(newFilters),
        };
      }
      return state;
    }),

  clearFilters: () =>
    set({
      filters: defaultFilters,
      activeFilterCount: 0,
    }),

  // Selection actions
  toggleImageSelection: (id) =>
    set((state) => {
      const newSelected = new Set(state.selectedImages);
      if (newSelected.has(id)) {
        newSelected.delete(id);
      } else {
        newSelected.add(id);
      }
      return { selectedImages: newSelected };
    }),

  selectImages: (ids) =>
    set((state) => ({
      selectedImages: new Set([...state.selectedImages, ...ids]),
    })),

  clearSelection: () =>
    set({
      selectedImages: new Set(),
      isMultiSelectMode: false,
    }),

  setMultiSelectMode: (enabled) =>
    set({
      isMultiSelectMode: enabled,
      selectedImages: enabled ? new Set() : new Set(),
    }),

  // Detail modal actions
  openDetail: (id) => set({ detailImageId: id }),
  closeDetail: () => set({ detailImageId: null }),
}));
