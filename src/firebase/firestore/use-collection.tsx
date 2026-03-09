
'use client';

import { useState, useEffect } from 'react';
import { 
  onSnapshot, 
  Query, 
  CollectionReference,
  DocumentData,
  QuerySnapshot 
} from 'firebase/firestore';

export function useCollection<T = DocumentData>(
  memoizedTargetRefOrQuery: Query<T> | CollectionReference<T> | null | undefined,
): { data: T[] | null; isLoading: boolean; error: any } {
  const [data, setData] = useState<T[] | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<any>(null);

  useEffect(() => {
    if (!memoizedTargetRefOrQuery) {
      setIsLoading(false);
      return;
    }

    const unsubscribe = onSnapshot(
      memoizedTargetRefOrQuery,
      (snapshot: QuerySnapshot<T>) => {
        const items = snapshot.docs.map((doc) => ({
          ...doc.data(),
          id: doc.id,
        }));
        setData(items);
        setIsLoading(false);
      },
      (err) => {
        console.error('Firestore Collection Error:', err);
        setError(err);
        setIsLoading(false);
      }
    );

    return () => unsubscribe();
  }, [memoizedTargetRefOrQuery]);

  return { data, isLoading, error };
}
