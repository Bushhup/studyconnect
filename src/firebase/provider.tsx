'use client';

import React, { DependencyList, createContext, useContext, ReactNode, useMemo, useState, useEffect } from 'react';
import { MOCK_USERS } from '@/lib/mock-db';

interface FirebaseProviderProps {
  children: ReactNode;
  firebaseApp: any;
  firestore: any;
  auth: any;
}

export interface FirebaseContextState {
  areServicesAvailable: boolean;
  user: any | null;
  isUserLoading: boolean;
  userError: Error | null;
}

export const FirebaseContext = createContext<FirebaseContextState | undefined>(undefined);

/**
 * MOCK PROVIDER
 * Overrides cloud Firebase with local state to "disconnect" from errors.
 */
export const FirebaseProvider: React.FC<FirebaseProviderProps> = ({ children }) => {
  const [user, setUser] = useState<any>(null);
  const [isUserLoading, setIsUserLoading] = useState(true);

  useEffect(() => {
    // Simulate initial auth check from local storage
    const savedUser = localStorage.getItem('mock_session_user');
    if (savedUser) {
      setUser(JSON.parse(savedUser));
    }
    setIsUserLoading(false);
  }, []);

  const contextValue = useMemo(() => ({
    areServicesAvailable: true,
    user,
    isUserLoading,
    userError: null,
    // Add setters for mock auth
    login: (userData: any) => {
      setUser(userData);
      localStorage.setItem('mock_session_user', JSON.stringify(userData));
    },
    logout: () => {
      setUser(null);
      localStorage.removeItem('mock_session_user');
    }
  }), [user, isUserLoading]);

  return (
    <FirebaseContext.Provider value={contextValue as any}>
      {children}
    </FirebaseContext.Provider>
  );
};

export const useFirebase = (): any => {
  const context = useContext(FirebaseContext);
  if (!context) throw new Error('useFirebase must be used within Provider');
  return { ...context, auth: {}, firestore: {}, firebaseApp: {} };
};

export const useAuth = () => ({});
export const useFirestore = () => ({});
export const useFirebaseApp = () => ({});

export function useMemoFirebase<T>(factory: () => T, deps: DependencyList): T {
  return useMemo(factory, deps);
}

export const useUser = (): any => {
  const context = useContext(FirebaseContext);
  return { 
    user: context?.user, 
    isUserLoading: context?.isUserLoading || false, 
    userError: null 
  };
};
