'use client';

import { useState, useEffect } from 'react';
import { 
  onSnapshot, 
  DocumentReference, 
  DocumentData,
  DocumentSnapshot 
} from 'firebase/firestore';
import { errorEmitter } from '@/firebase/error-emitter';
import { FirestorePermissionError, type SecurityRuleContext } from '@/firebase/errors';

export function useDoc<T = DocumentData>(
  memoizedDocRef: DocumentReference<T> | null | undefined,
): { data: T | null; isLoading: boolean; error: any } {
  const [data, setData] = useState<T | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<any>(null);

  useEffect(() => {
    if (!memoizedDocRef) {
      setIsLoading(false);
      return;
    }

    const unsubscribe = onSnapshot(
      memoizedDocRef,
      (doc: DocumentSnapshot<T>) => {
        if (doc.exists()) {
          setData({ ...doc.data(), id: doc.id } as T);
        } else {
          setData(null);
        }
        setIsLoading(false);
      },
      async (err) => {
        const permissionError = new FirestorePermissionError({
          path: memoizedDocRef.path,
          operation: 'get',
        } satisfies SecurityRuleContext);

        errorEmitter.emit('permission-error', permissionError);
        
        setError(permissionError);
        setIsLoading(false);
      }
    );

    return () => unsubscribe();
  }, [memoizedDocRef]);

  return { data, isLoading, error };
}
