'use client';
    
import { useState, useEffect } from 'react';
import { getLocalData } from '@/lib/mock-db';

export function useDoc<T = any>(
  memoizedDocRef: any | null | undefined,
): { data: T | null, isLoading: boolean, error: any } {
  const [data, setData] = useState<T | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    if (!memoizedDocRef) return;

    // Path like: colleges/id/users/uid
    const parts = memoizedDocRef.path?.split('/') || [];
    const collectionName = parts[parts.length - 2];
    const docId = parts[parts.length - 1];

    const loadDoc = () => {
      if (!collectionName || !docId) return;
      const all = getLocalData(collectionName);
      const found = all.find((item: any) => item.id === docId || item.email === docId);
      setData(found || null);
      setIsLoading(false);
    };

    loadDoc();
    window.addEventListener('mock-data-change', loadDoc);
    return () => window.removeEventListener('mock-data-change', loadDoc);
  }, [memoizedDocRef]);

  return { data, isLoading, error: null };
}
