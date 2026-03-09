'use client';

import { useState, useEffect } from 'react';
import { 
  onSnapshot, 
  Query, 
  CollectionReference,
  DocumentData,
  QuerySnapshot 
} from 'firebase/firestore';
import { errorEmitter } from '@/firebase/error-emitter';
import { FirestorePermissionError, type SecurityRuleContext } from '@/firebase/errors';

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
      async (err) => {
        // Create the rich, contextual error for the developer overlay
        const permissionError = new FirestorePermissionError({
          path: (memoizedTargetRefOrQuery as any).path || 'query',
          operation: 'list',
        } satisfies SecurityRuleContext);

        // Emit the error to the global listener
        errorEmitter.emit('permission-error', permissionError);
        
        setError(permissionError);
        setIsLoading(false);
      }
    );

    return () => unsubscribe();
  }, [memoizedTargetRefOrQuery]);

  return { data, isLoading, error };
}
