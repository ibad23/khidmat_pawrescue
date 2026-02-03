import { useState, useMemo, useCallback, useEffect } from "react";

interface UsePaginationOptions {
  itemsPerPage?: number;
  resetDeps?: unknown[];
}

interface UsePaginationResult<T> {
  currentPage: number;
  totalPages: number;
  paginatedItems: T[];
  goToPage: (page: number) => void;
  getPageNumbers: () => (number | string)[];
  startIndex: number;
  endIndex: number;
}

export function usePagination<T>(
  items: T[],
  options: UsePaginationOptions = {}
): UsePaginationResult<T> {
  const { itemsPerPage = 15, resetDeps = [] } = options;
  const [currentPage, setCurrentPage] = useState(1);

  const totalPages = Math.ceil(items.length / itemsPerPage);

  const paginatedItems = useMemo(() => {
    const startIndex = (currentPage - 1) * itemsPerPage;
    return items.slice(startIndex, startIndex + itemsPerPage);
  }, [items, currentPage, itemsPerPage]);

  const startIndex = (currentPage - 1) * itemsPerPage + 1;
  const endIndex = Math.min(currentPage * itemsPerPage, items.length);

  // Reset to page 1 when dependencies change (e.g., filters)
  useEffect(() => {
    setCurrentPage(1);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, resetDeps);

  const goToPage = useCallback(
    (page: number) => {
      setCurrentPage(Math.max(1, Math.min(page, totalPages || 1)));
    },
    [totalPages]
  );

  const getPageNumbers = useCallback((): (number | string)[] => {
    const pages: (number | string)[] = [];
    if (totalPages <= 7) {
      for (let i = 1; i <= totalPages; i++) pages.push(i);
    } else {
      pages.push(1);
      if (currentPage > 3) pages.push("...");

      const start = Math.max(2, currentPage - 1);
      const end = Math.min(totalPages - 1, currentPage + 1);

      for (let i = start; i <= end; i++) {
        if (!pages.includes(i)) pages.push(i);
      }

      if (currentPage < totalPages - 2) pages.push("...");
      if (!pages.includes(totalPages)) pages.push(totalPages);
    }
    return pages;
  }, [currentPage, totalPages]);

  return {
    currentPage,
    totalPages,
    paginatedItems,
    goToPage,
    getPageNumbers,
    startIndex,
    endIndex,
  };
}
