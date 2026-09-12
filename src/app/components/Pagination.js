"use client";
import React from "react";

const Pagination = ({
  currentPage = 1,
  totalPages = 1,
  onPageChange,
  totalItems = 0,
  itemsPerPage = 10,
  itemName = "items",
}) => {
  if (totalPages <= 1) return null;

  const startItem = totalItems === 0 ? 0 : (currentPage - 1) * itemsPerPage + 1;
  const endItem = Math.min(currentPage * itemsPerPage, totalItems);

  const getPageNumbers = () => {
    const pages = [];
    if (totalPages <= 5) {
      for (let i = 1; i <= totalPages; i++) pages.push(i);
    } else if (currentPage <= 3) {
      pages.push(1, 2, 3, 4, "...", totalPages);
    } else if (currentPage >= totalPages - 2) {
      pages.push(1, "...", totalPages - 3, totalPages - 2, totalPages - 1, totalPages);
    } else {
      pages.push(1, "...", currentPage - 1, currentPage, currentPage + 1, "...", totalPages);
    }
    return pages;
  };

  return (
    <div className="flex flex-col items-center gap-3 py-6 mt-4 border-t border-white/20">
      {/* Item count — small and subtle */}
      {totalItems > 0 && (
        <p className="text-[10px] uppercase tracking-widest text-gray">
          {startItem}–{endItem} of {totalItems} {itemName}
        </p>
      )}

      {/* Pagination controls — fully flex, wraps on small screens */}
      <div className="flex flex-wrap items-center justify-center gap-1">
        {/* Prev */}
        <button
          type="button"
          onClick={() => onPageChange(currentPage - 1)}
          disabled={currentPage === 1}
          aria-label="Previous page"
          className="h-8 px-3 text-[11px] uppercase tracking-wider border border-white/60 hover:bg-white hover:text-black transition-colors duration-150 disabled:opacity-20 disabled:pointer-events-none cursor-pointer"
        >
          ‹ Prev
        </button>

        {/* Page numbers */}
        {getPageNumbers().map((page, idx) => {
          if (page === "...") {
            return (
              <span
                key={`e-${idx}`}
                className="h-8 w-7 flex items-center justify-center text-[11px] text-gray select-none"
              >
                …
              </span>
            );
          }
          const isActive = currentPage === page;
          return (
            <button
              key={`p-${page}`}
              type="button"
              onClick={() => onPageChange(page)}
              aria-label={`Page ${page}`}
              aria-current={isActive ? "page" : undefined}
              className={`h-8 w-8 text-[11px] font-semibold transition-colors duration-150 border cursor-pointer ${
                isActive
                  ? "bg-white text-black border-white"
                  : "border-white/30 text-white hover:border-white hover:bg-white hover:text-black"
              }`}
            >
              {page}
            </button>
          );
        })}

        {/* Next */}
        <button
          type="button"
          onClick={() => onPageChange(currentPage + 1)}
          disabled={currentPage === totalPages}
          aria-label="Next page"
          className="h-8 px-3 text-[11px] uppercase tracking-wider border border-white/60 hover:bg-white hover:text-black transition-colors duration-150 disabled:opacity-20 disabled:pointer-events-none cursor-pointer"
        >
          Next ›
        </button>
      </div>
    </div>
  );
};

export default Pagination;
