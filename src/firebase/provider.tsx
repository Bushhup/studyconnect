
'use client';

import React, { DependencyList, createContext, useContext, ReactNode, useMemo, useState, useEffect } from 'react';
import { onAuthStateChanged, User } from 'firebase/auth';

interface FirebaseProviderProps {
  children: ReactNode;
  firebaseApp: any;
  firestore: any;
  auth: any;
}

export interface FirebaseContextState {
  areServicesAvailable: boolean;
  user: User | null;
  isUserLoading: boolean;
  userError: Error | null;
  auth: any;
  firestore: any;
}

export const FirebaseContext = createContext<FirebaseContextState | undefined>(undefined);

export const FirebaseProvider: React.FC<FirebaseProviderProps> = ({ children, auth, firestore }) => {
  const [user, setUser] = useState<User | null>(null);
  const [isUserLoading, setIsUserLoading] = useState(true);
  const [userError, setUserError] = useState<Error | null>(null);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(
      auth,
      (user) => {
        setUser(user);
        setIsUserLoading(false);
      },
      (error) => {
        setUserError(error as Error);
        setIsUserLoading(false);
      }
    );

    return () => unsubscribe();
  }, [auth]);

  const contextValue = useMemo(() => ({
    areServicesAvailable: !!auth && !!firestore,
    user,
    isUserLoading,
    userError,
    auth,
    firestore,
  }), [user, isUserLoading, userError, auth, firestore]);

  return (
    <FirebaseContext.Provider value={contextValue}>
      {children}
    </FirebaseContext.Provider>
  );
};

export const useFirebase = (): FirebaseContextState => {
  const context = useContext(FirebaseContext);
  if (!context) throw new Error('useFirebase must be used within a FirebaseProvider');
  return context;
};

export function useMemoFirebase<T>(factory: () => T, deps: DependencyList): T {
  return useMemo(factory, deps);
}

export const useUser = () => {
  const { user, isUserLoading, userError } = useFirebase();
  return { user, isUserLoading, userError };
};

export const useFirestore = () => {
  const { firestore } = useFirebase();
  return firestore;
};

export const useAuth = () => {
  const { auth } = useFirebase();
  return auth;
};
