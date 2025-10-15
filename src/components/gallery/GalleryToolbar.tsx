"use client";

import { useState } from "react";
import Link from "next/link";
import { useGalleryStore } from "@/stores/gallery-store";
import {
  LayoutGrid,
  List,
  Columns,
  SortAsc,
  Search,
  Filter,
  X,
  Upload,
  ChevronDown,
} from "lucide-react";

export function GalleryToolbar() {
  const {
    viewMode,
    setViewMode,
    sortBy,
    setSortBy,
    gridColumns,
    setGridColumns,
    filters,
    setSearch,
    activeFilterCount,
    clearFilters,
  } = useGalleryStore();

  const [searchValue, setSearchValue] = useState(filters.search);
  const [showSortMenu, setShowSortMenu] = useState(false);
  const [showViewMenu, setShowViewMenu] = useState(false);

  const handleSearchChange = (value: string) => {
    setSearchValue(value);
    const debounceTimer = setTimeout(() => {
      setSearch(value);
    }, 300);
    return () => clearTimeout(debounceTimer);
  };

  const sortOptions = [
    { value: "date-desc", label: "Newest first" },
    { value: "date-asc", label: "Oldest first" },
    { value: "rating-desc", label: "Highest rated" },
    { value: "rating-asc", label: "Lowest rated" },
    { value: "name-asc", label: "Name (A-Z)" },
    { value: "name-desc", label: "Name (Z-A)" },
  ];

  const viewModes = [
    { value: "grid", label: "Grid", icon: LayoutGrid },
    { value: "masonry", label: "Masonry", icon: Columns },
    { value: "list", label: "List", icon: List },
  ];

  const currentSort = sortOptions.find((opt) => opt.value === sortBy);
  const currentView = viewModes.find((mode) => mode.value === viewMode);

  return (
    <div className="sticky top-0 z-10 border-b border-gray-200 bg-white px-4 py-3">
      <div className="flex items-center justify-between gap-4">
        {/* Left side: Search */}
        <div className="max-w-md flex-1">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400" />
            <input
              type="text"
              placeholder="Search images..."
              value={searchValue}
              onChange={(e) => handleSearchChange(e.target.value)}
              className="w-full rounded-lg border border-gray-300 py-2 pl-10 pr-4 focus:border-transparent focus:outline-none focus:ring-2 focus:ring-primary"
            />
          </div>
        </div>

        {/* Right side: Controls */}
        <div className="flex items-center gap-2">
          {/* Active filters indicator */}
          {activeFilterCount > 0 && (
            <button
              onClick={clearFilters}
              className="flex items-center gap-2 rounded-lg bg-primary/10 px-3 py-2 text-sm font-medium text-primary transition-colors hover:bg-primary/20"
            >
              <Filter className="h-4 w-4" />
              {activeFilterCount} filter{activeFilterCount > 1 ? "s" : ""}
              <X className="h-3 w-3" />
            </button>
          )}

          {/* View mode dropdown */}
          <div className="relative">
            <button
              onClick={() => setShowViewMenu(!showViewMenu)}
              className="flex items-center gap-2 rounded-lg border border-gray-300 bg-white px-3 py-2 text-sm font-medium text-gray-700 transition-colors hover:bg-gray-50"
            >
              {currentView && <currentView.icon className="h-4 w-4" />}
              <span className="hidden sm:inline">{currentView?.label}</span>
              <ChevronDown className="h-4 w-4" />
            </button>

            {showViewMenu && (
              <>
                <div
                  className="fixed inset-0 z-10"
                  onClick={() => setShowViewMenu(false)}
                />
                <div className="absolute right-0 z-20 mt-2 w-40 rounded-lg border border-gray-200 bg-white shadow-lg">
                  {viewModes.map((mode) => (
                    <button
                      key={mode.value}
                      onClick={() => {
                        setViewMode(mode.value as any);
                        setShowViewMenu(false);
                      }}
                      className={`flex w-full items-center gap-2 px-4 py-2 text-left text-sm first:rounded-t-lg last:rounded-b-lg hover:bg-gray-50 ${
                        viewMode === mode.value
                          ? "bg-primary/10 font-medium text-primary"
                          : "text-gray-700"
                      }`}
                    >
                      <mode.icon className="h-4 w-4" />
                      {mode.label}
                    </button>
                  ))}
                </div>
              </>
            )}
          </div>

          {/* Grid columns (only show in grid mode) */}
          {viewMode === "grid" && (
            <div className="hidden items-center gap-1 rounded-lg border border-gray-300 px-2 py-2 md:flex">
              {[2, 3, 4, 5, 6].map((cols) => (
                <button
                  key={cols}
                  onClick={() => setGridColumns(cols)}
                  className={`rounded px-2 py-1 text-xs font-medium transition-colors ${
                    gridColumns === cols
                      ? "bg-primary text-white"
                      : "text-gray-600 hover:bg-gray-100"
                  }`}
                >
                  {cols}
                </button>
              ))}
            </div>
          )}

          {/* Sort dropdown */}
          <div className="relative">
            <button
              onClick={() => setShowSortMenu(!showSortMenu)}
              className="flex items-center gap-2 rounded-lg border border-gray-300 bg-white px-3 py-2 text-sm font-medium text-gray-700 transition-colors hover:bg-gray-50"
            >
              <SortAsc className="h-4 w-4" />
              <span className="hidden sm:inline">{currentSort?.label}</span>
              <ChevronDown className="h-4 w-4" />
            </button>

            {showSortMenu && (
              <>
                <div
                  className="fixed inset-0 z-10"
                  onClick={() => setShowSortMenu(false)}
                />
                <div className="absolute right-0 z-20 mt-2 w-48 rounded-lg border border-gray-200 bg-white shadow-lg">
                  {sortOptions.map((option) => (
                    <button
                      key={option.value}
                      onClick={() => {
                        setSortBy(option.value as any);
                        setShowSortMenu(false);
                      }}
                      className={`w-full px-4 py-2 text-left text-sm first:rounded-t-lg last:rounded-b-lg hover:bg-gray-50 ${
                        sortBy === option.value
                          ? "bg-primary/10 font-medium text-primary"
                          : "text-gray-700"
                      }`}
                    >
                      {option.label}
                    </button>
                  ))}
                </div>
              </>
            )}
          </div>

          {/* Upload button */}
          <Link
            href="/dashboard/upload"
            className="flex items-center gap-2 rounded-lg bg-primary px-4 py-2 text-sm font-medium text-white transition-colors hover:bg-primary/90"
          >
            <Upload className="h-4 w-4" />
            <span className="hidden sm:inline">Upload</span>
          </Link>
        </div>
      </div>
    </div>
  );
}
