'use client';

import React, { DependencyList, createContext, useContext, ReactNode, useMemo, useState, useEffect } from 'react';

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
  login: (userData: any) => void;
  logout: () => void;
}

export const FirebaseContext = createContext<FirebaseContextState | undefined>(undefined);

/**
 * MOCK PROVIDER
 * Overrides cloud Firebase with local state to provide a stable, error-free experience.
 */
export const FirebaseProvider: React.FC<FirebaseProviderProps> = ({ children }) => {
  const [user, setUser] = useState<any>(null);
  const [isUserLoading, setIsUserLoading] = useState(true);

  useEffect(() => {
    // Simulate initial auth check from local storage
    const savedUser = localStorage.getItem('mock_session_user');
    if (savedUser) {
      try {
        const parsed = JSON.parse(savedUser);
        // Ensure UID compatibility
        if (parsed && parsed.id && !parsed.uid) parsed.uid = parsed.id;
        setUser(parsed);
      } catch (e) {
        console.error('Failed to parse saved user', e);
      }
    }
    setIsUserLoading(false);
  }, []);

  const contextValue = useMemo(() => ({
    areServicesAvailable: true,
    user,
    isUserLoading,
    userError: null,
    login: (userData: any) => {
      // Normalizing for Firebase component compatibility (uid)
      const normalizedUser = { ...userData, uid: userData.id || userData.uid };
      setUser(normalizedUser);
      localStorage.setItem('mock_session_user', JSON.stringify(normalizedUser));
    },
    logout: () => {
      setUser(null);
      localStorage.removeItem('mock_session_user');
    }
  }), [user, isUserLoading]);

  return (
    <FirebaseContext.Provider value={contextValue}>
      {children}
    </FirebaseContext.Provider>
  );
};

export const useFirebase = (): FirebaseContextState => {
  const context = useContext(FirebaseContext);
  if (!context) throw new Error('useFirebase must be used within Provider');
  return context;
};

// Dummy exports to prevent crashes in SDK function calls while in mock mode
export const useAuth = () => ({});
export const useFirestore = () => ({});
export const useFirebaseApp = () => ({});

export function useMemoFirebase<T>(factory: () => T, deps: DependencyList): T {
  return useMemo(factory, deps);
}

export const useUser = (): { user: any, isUserLoading: boolean, userError: any, logout: () => void } => {
  const context = useContext(FirebaseContext);
  return { 
    user: context?.user, 
    isUserLoading: context?.isUserLoading || false, 
    userError: null,
    logout: context?.logout || (() => {})
  };
};
