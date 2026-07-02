import { useMemo, useState } from 'react';

export function useSortableTable<T, K extends string>(
  items: T[],
  sortFns: Record<K, (a: T, b: T) => number>,
  defaultKey: K,
  defaultDir: 'asc' | 'desc' = 'desc',
) {
  const [sortKey, setSortKey] = useState<K>(defaultKey);
  const [sortDir, setSortDir] = useState<'asc' | 'desc'>(defaultDir);

  const sorted = useMemo(() => {
    const dir = sortDir === 'asc' ? 1 : -1;
    return [...items].sort((a, b) => sortFns[sortKey](a, b) * dir);
  }, [items, sortKey, sortDir, sortFns]);

  const toggleSort = (key: K) => {
    if (key === sortKey) {
      setSortDir((d) => (d === 'asc' ? 'desc' : 'asc'));
    } else {
      setSortKey(key);
      setSortDir('asc');
    }
  };

  const indicator = (key: K) => (key === sortKey ? (sortDir === 'asc' ? ' ▲' : ' ▼') : '');

  return { sorted, toggleSort, indicator };
}

export function usePagination<T>(items: T[], initialPageSize = 10) {
  const [page, setPage] = useState(1);
  const [pageSize, setPageSizeState] = useState(initialPageSize);
  const totalPages = Math.max(1, Math.ceil(items.length / pageSize));
  const clampedPage = Math.min(page, totalPages);
  const pageItems = items.slice((clampedPage - 1) * pageSize, clampedPage * pageSize);

  const setPageSize = (n: number) => {
    setPageSizeState(n);
    setPage(1);
  };

  return { page: clampedPage, pageSize, totalPages, pageItems, setPage, setPageSize };
}
