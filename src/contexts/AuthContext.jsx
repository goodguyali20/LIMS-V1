import React, { createContext, useState, useEffect, useMemo } from 'react';
import { auth } from '/src/firebase-config.js'; // Corrected with absolute path
import { onAuthStateChanged, signOut as firebaseSignOut } from 'firebase/auth';

export const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    // Subscribe to Firebase auth state changes
    const unsubscribe = onAuthStateChanged(auth, (currentUser) => {
      setUser(currentUser);
      setIsLoading(false);
    });

    // Cleanup subscription on unmount
    return () => unsubscribe();
  }, []);

  const signOut = async () => {
    try {
      await firebaseSignOut(auth);
      // setUser(null) will be handled by the onAuthStateChanged listener
    } catch (error) {
      console.error('Error signing out:', error);
      // Optionally, show a toast notification for sign-out errors
    }
  };

  const isAuthenticated = !!user;

  // Memoize the context value to prevent unnecessary re-renders
  const value = useMemo(
    () => ({
      user,
      isLoading,
      isAuthenticated,
      signOut,
    }),
    [user, isLoading, isAuthenticated]
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};