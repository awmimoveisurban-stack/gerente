import { useState, useMemo } from 'react';

export interface PaginationConfig {
  page: number;
  pageSize: number;
  total: number;
}

export interface PaginationState extends PaginationConfig {
  totalPages: number;
  hasNextPage: boolean;
  hasPrevPage: boolean;
  startIndex: number;
  endIndex: number;
}

export const usePagination = <T,>(data: T[], initialPageSize: number = 10) => {
  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(initialPageSize);

  const paginationState: PaginationState = useMemo(() => {
    const total = data.length;
    const totalPages = Math.ceil(total / pageSize);
    const hasNextPage = page < totalPages;
    const hasPrevPage = page > 1;
    const startIndex = (page - 1) * pageSize;
    const endIndex = Math.min(startIndex + pageSize, total);

    return {
      page,
      pageSize,
      total,
      totalPages,
      hasNextPage,
      hasPrevPage,
      startIndex,
      endIndex,
    };
  }, [data.length, page, pageSize]);

  const paginatedData = useMemo(() => {
    return data.slice(paginationState.startIndex, paginationState.endIndex);
  }, [data, paginationState.startIndex, paginationState.endIndex]);

  const goToPage = (newPage: number) => {
    if (newPage >= 1 && newPage <= paginationState.totalPages) {
      setPage(newPage);
    }
  };

  const nextPage = () => {
    if (paginationState.hasNextPage) {
      setPage(page + 1);
    }
  };

  const prevPage = () => {
    if (paginationState.hasPrevPage) {
      setPage(page - 1);
    }
  };

  const resetPagination = () => {
    setPage(1);
  };

  return {
    paginationState,
    paginatedData,
    goToPage,
    nextPage,
    prevPage,
    setPageSize,
    resetPagination,
  };
};
