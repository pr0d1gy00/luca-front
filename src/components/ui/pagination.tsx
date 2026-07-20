"use client";

import React from "react";
import {
  ChevronLeft,
  ChevronRight,
  ChevronsLeft,
  ChevronsRight,
} from "lucide-react";

export interface PaginationProps {
  /** Current 1-based page number */
  currentPage: number;
  /** Total number of pages */
  lastPage: number;
  /** Callback triggered on page selection */
  onPageChange: (page: number) => void;
  /** Total number of items (optional for summary text) */
  total?: number;
  /** Items per page (optional for range calculation) */
  perPage?: number;
  /** Start index of current page (1-based, optional) */
  from?: number | null;
  /** End index of current page (1-based, optional) */
  to?: number | null;
  /** Number of page buttons to show on either side of current page (default: 1) */
  siblingCount?: number;
  /** Design system color variant (care = teal, primary = blue, default = neutral) */
  variant?: "care" | "primary" | "default";
  /** Optional custom CSS classes for the container */
  className?: string;
  /** Show items range summary text ("Mostrando X - Y de Z") */
  showSummary?: boolean;
}

/**
  Generate page range array with 'DOTS' placeholders
 */
export function generatePaginationRange(
  currentPage: number,
  lastPage: number,
  siblingCount = 1,
): (number | "DOTS")[] {
  // If total pages is small, return full range
  const totalNumbers = siblingCount * 2 + 5;
  if (lastPage <= totalNumbers) {
    return Array.from({ length: lastPage }, (_, i) => i + 1);
  }

  const leftSiblingIndex = Math.max(currentPage - siblingCount, 1);
  const rightSiblingIndex = Math.min(currentPage + siblingCount, lastPage);

  const shouldShowLeftDots = leftSiblingIndex > 2;
  const shouldShowRightDots = rightSiblingIndex < lastPage - 1;

  if (!shouldShowLeftDots && shouldShowRightDots) {
    const leftItemCount = 3 + 2 * siblingCount;
    const leftRange = Array.from({ length: leftItemCount }, (_, i) => i + 1);
    return [...leftRange, "DOTS", lastPage];
  }

  if (shouldShowLeftDots && !shouldShowRightDots) {
    const rightItemCount = 3 + 2 * siblingCount;
    const rightRange = Array.from(
      { length: rightItemCount },
      (_, i) => lastPage - rightItemCount + i + 1,
    );
    return [1, "DOTS", ...rightRange];
  }

  if (shouldShowLeftDots && shouldShowRightDots) {
    const middleRange = Array.from(
      { length: rightSiblingIndex - leftSiblingIndex + 1 },
      (_, i) => leftSiblingIndex + i,
    );
    return [1, "DOTS", ...middleRange, "DOTS", lastPage];
  }

  return [];
}

export function Pagination({
  currentPage,
  lastPage,
  onPageChange,
  total,
  perPage = 10,
  from,
  to,
  siblingCount = 1,
  variant = "care",
  className = "",
  showSummary = true,
}: PaginationProps) {
  if (lastPage <= 0) return null;

  const pages = generatePaginationRange(currentPage, lastPage, siblingCount);

  // Variant color definitions
  const activeStyles =
    variant === "care"
      ? "bg-teal-600 text-white border-teal-600 shadow-sm"
      : variant === "primary"
        ? "bg-blue-600 text-white border-blue-600 shadow-sm"
        : "bg-slate-900 text-white border-slate-900 shadow-sm";

  const hoverStyles =
    variant === "care"
      ? "hover:bg-teal-50 hover:text-teal-700 hover:border-teal-200"
      : variant === "primary"
        ? "hover:bg-blue-50 hover:text-blue-700 hover:border-blue-200"
        : "hover:bg-slate-100 hover:text-slate-900 hover:border-slate-300";

  // Calculate default range if from/to not explicitly provided
  const calcFrom =
    from ?? (total && total > 0 ? (currentPage - 1) * perPage + 1 : null);
  const calcTo =
    to ?? (total && total > 0 ? Math.min(currentPage * perPage, total) : null);

  return (
    <div
      className={`flex flex-col sm:flex-row items-center justify-between gap-4 p-3 bg-white border border-slate-200 rounded-2xl shadow-xs transition-all ${className}`}
    >
      {/* Items range summary */}
      {showSummary && (
        <div className="text-xs text-slate-500 font-medium">
          {calcFrom !== null && calcTo !== null && total !== undefined ? (
            <span>
              Mostrando{" "}
              <strong className="font-bold text-slate-900">{calcFrom}</strong> a{" "}
              <strong className="font-bold text-slate-900">{calcTo}</strong> de{" "}
              <strong className="font-bold text-slate-900">{total}</strong>{" "}
              resultados
            </span>
          ) : (
            <span>
              Página{" "}
              <strong className="font-bold text-slate-900">
                {currentPage}
              </strong>{" "}
              de{" "}
              <strong className="font-bold text-slate-900">{lastPage}</strong>
            </span>
          )}
        </div>
      )}

      {/* Pagination controls */}
      <div className="flex items-center gap-1">
        {/* First Page */}
        <button
          type="button"
          onClick={() => onPageChange(1)}
          disabled={currentPage === 1}
          aria-label="Primera página"
          title="Primera página"
          className={`p-2 rounded-xl text-slate-500 border border-slate-200 transition-all ${hoverStyles} disabled:opacity-30 disabled:cursor-not-allowed disabled:hover:bg-transparent disabled:hover:text-slate-500 disabled:hover:border-slate-200`}
        >
          <ChevronsLeft className="w-4 h-4" />
        </button>

        {/* Previous Page */}
        <button
          type="button"
          onClick={() => onPageChange(currentPage - 1)}
          disabled={currentPage === 1}
          aria-label="Página anterior"
          title="Página anterior"
          className={`px-3 py-1.5 rounded-xl text-xs font-bold text-slate-700 border border-slate-200 transition-all flex items-center gap-1 ${hoverStyles} disabled:opacity-30 disabled:cursor-not-allowed disabled:hover:bg-transparent disabled:hover:text-slate-700 disabled:hover:border-slate-200`}
        >
          <ChevronLeft className="w-4 h-4" />
          <span className="hidden md:inline">Anterior</span>
        </button>

        {/* Page Numbers */}
        <div className="flex items-center gap-1 px-1">
          {pages.map((page, index) => {
            if (page === "DOTS") {
              return (
                <span
                  key={`dots-${index}`}
                  className="px-2 py-1 text-xs text-slate-400 font-bold select-none"
                >
                  •••
                </span>
              );
            }

            const isCurrent = page === currentPage;

            return (
              <button
                key={page}
                type="button"
                onClick={() => onPageChange(page)}
                aria-current={isCurrent ? "page" : undefined}
                className={`min-w-[34px] h-8.5 px-2.5 rounded-xl text-xs font-bold transition-all border ${
                  isCurrent
                    ? activeStyles
                    : `bg-white text-slate-700 border-slate-200 ${hoverStyles}`
                }`}
              >
                {page}
              </button>
            );
          })}
        </div>

        {/* Next Page */}
        <button
          type="button"
          onClick={() => onPageChange(currentPage + 1)}
          disabled={currentPage === lastPage}
          aria-label="Página siguiente"
          title="Página siguiente"
          className={`px-3 py-1.5 rounded-xl text-xs font-bold text-slate-700 border border-slate-200 transition-all flex items-center gap-1 ${hoverStyles} disabled:opacity-30 disabled:cursor-not-allowed disabled:hover:bg-transparent disabled:hover:text-slate-700 disabled:hover:border-slate-200`}
        >
          <span className="hidden md:inline">Siguiente</span>
          <ChevronRight className="w-4 h-4" />
        </button>

        {/* Last Page */}
        <button
          type="button"
          onClick={() => onPageChange(lastPage)}
          disabled={currentPage === lastPage}
          aria-label="Última página"
          title="Última página"
          className={`p-2 rounded-xl text-slate-500 border border-slate-200 transition-all ${hoverStyles} disabled:opacity-30 disabled:cursor-not-allowed disabled:hover:bg-transparent disabled:hover:text-slate-500 disabled:hover:border-slate-200`}
        >
          <ChevronsRight className="w-4 h-4" />
        </button>
      </div>
    </div>
  );
}
