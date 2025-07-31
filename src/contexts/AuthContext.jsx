import React, { useState, useEffect, useMemo, useCallback } from 'react';
import { auth } from '../firebase/config.js';
import { onAuthStateChanged, signOut as firebaseSignOut, signInWithEmailAndPassword, updateProfile } from 'firebase/auth';
import { doc, getDoc, updateDoc } from 'firebase/firestore';
import { db } from '../firebase/config.js';
import { AuthContext } from './AuthContextBase.js';

// Re-export useAuth for direct imports
export { useAuth } from './AuthContextBase.js';

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [isLoading, setIsLoading] = useState(true);

  // Fetch user role from Firestore with proper validation
  const fetchUserRole = useCallback(async (currentUser) => {
    try {
      const userDoc = await getDoc(doc(db, 'users', currentUser.uid));
      if (userDoc.exists()) {
        const userData = userDoc.data();
        // Validate role against allowed roles
        const allowedRoles = ['admin', 'manager', 'technician', 'phlebotomist', 'user'];
        const role = allowedRoles.includes(userData.role) ? userData.role : 'user';
        
        return {
          ...currentUser,
          role,
          permissions: userData.permissions || [],
          department: userData.department || null,
          isActive: userData.isActive !== false // Default to true if not specified
        };
      } else {
        // Create default user profile if doesn't exist
        console.warn('User profile not found, creating default profile');
        return {
          ...currentUser,
          role: 'user',
          permissions: [],
          department: null,
          isActive: true
        };
      }
    } catch (error) {
      console.error('Error fetching user role:', error);
      // Return safe default on error
      return {
        ...currentUser,
        role: 'user',
        permissions: [],
        department: null,
        isActive: false
      };
    }
  }, []);

  useEffect(() => {
    // Subscribe to Firebase auth state changes
    const unsubscribe = onAuthStateChanged(auth, async (currentUser) => {
      if (currentUser) {
        try {
          // Fetch user role and permissions from database
          const userWithRole = await fetchUserRole(currentUser);
          
          // Only set user if they are active
          if (userWithRole.isActive) {
            setUser(userWithRole);
          } else {
            console.warn('Inactive user attempted to access system');
            setUser(null);
          }
        } catch (error) {
          console.error('Error processing user authentication:', error);
          setUser(null);
        }
      } else {
        setUser(null);
      }
      setIsLoading(false);
    });

    // Cleanup subscription on unmount
    return () => unsubscribe();
  }, [fetchUserRole]);

  const login = useCallback(async (email, password) => {
    try {
      const userCredential = await signInWithEmailAndPassword(auth, email, password);
      const currentUser = userCredential.user;
      
      // Fetch user role and permissions
      const userWithRole = await fetchUserRole(currentUser);
      
      // Only allow active users to login
      if (!userWithRole.isActive) {
        await firebaseSignOut(auth);
        throw new Error('Account is deactivated. Please contact your administrator.');
      }
      
      setUser(userWithRole);
      return userWithRole;
    } catch (error) {
      console.error('Login error:', error);
      
      // Handle specific Firebase auth errors
      switch (error.code) {
        case 'auth/user-not-found':
          throw new Error('No account found with this email address.');
        case 'auth/wrong-password':
          throw new Error('Incorrect password. Please try again.');
        case 'auth/invalid-email':
          throw new Error('Invalid email address.');
        case 'auth/user-disabled':
          throw new Error('This account has been disabled.');
        case 'auth/too-many-requests':
          throw new Error('Too many failed attempts. Please try again later.');
        default:
          throw new Error('Login failed. Please check your credentials and try again.');
      }
    }
  }, [fetchUserRole]);

  const signOut = useCallback(async () => {
    try {
      await firebaseSignOut(auth);
      setUser(null);
    } catch (error) {
      console.error('Error signing out:', error);
      throw new Error('Failed to sign out. Please try again.');
    }
  }, []);

  // Check if user has specific permission
  const hasPermission = useCallback((permission) => {
    if (!user || !user.permissions) return false;
    return user.permissions.includes(permission);
  }, [user]);

  // Check if user has any of the specified roles
  const hasRole = useCallback((roles) => {
    if (!user) return false;
    const userRoles = Array.isArray(roles) ? roles : [roles];
    return userRoles.includes(user.role);
  }, [user]);

  // Update user display name
  const updateUserDisplayName = useCallback(async (newDisplayName) => {
    if (!user) throw new Error('No user logged in');
    
    try {
      const currentUser = auth.currentUser;
      
      // Update Firebase Auth profile
      await updateProfile(currentUser, {
        displayName: newDisplayName.trim()
      });

      // Update Firestore user document
      const userDocRef = doc(db, 'users', currentUser.uid);
      await updateDoc(userDocRef, {
        displayName: newDisplayName.trim()
      });

      // Update local user state
      setUser(prevUser => ({
        ...prevUser,
        displayName: newDisplayName.trim()
      }));

      return true;
    } catch (error) {
      console.error('Error updating display name:', error);
      throw error;
    }
  }, [user]);

  // Memoize the context value to prevent unnecessary re-renders
  const value = useMemo(() => ({
    user,
    isLoading,
    login,
    signOut,
    hasPermission,
    hasRole,
    updateUserDisplayName,
  }), [user, isLoading, login, signOut, hasPermission, hasRole, updateUserDisplayName]);

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};