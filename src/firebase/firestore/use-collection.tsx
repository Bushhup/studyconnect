'use client';

import { useState, useEffect } from 'react';
import { getLocalData } from '@/lib/mock-db';

export function useCollection<T = any>(
    memoizedTargetRefOrQuery: any | null | undefined,
): { data: T[] | null, isLoading: boolean, error: any } {
  const [data, setData] = useState<T[] | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    if (!memoizedTargetRefOrQuery) return;

    // Determine collection name from path (e.g. "colleges/id/users" -> "users")
    const path = typeof memoizedTargetRefOrQuery === 'string' ? memoizedTargetRefOrQuery : '';
    const collectionName = path.split('/').pop() || 'users';

    const loadData = () => {
      const localData = getLocalData(collectionName);
      setData(localData);
      setIsLoading(false);
    };

    loadData();

    // Listen for local changes
    window.addEventListener('mock-data-change', loadData);
    return () => window.removeEventListener('mock-data-change', loadData);
  }, [memoizedTargetRefOrQuery]);

  return { data, isLoading, error: null };
}
