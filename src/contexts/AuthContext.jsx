import React, { createContext, useContext, useState, useEffect } from 'react';
import { onAuthStateChanged, signOut } from 'firebase/auth';
import { doc, getDoc } from 'firebase/firestore';
import { auth, db } from '../firebase/config';
import { logAuditEvent } from '../utils/auditLogger';

const AuthContext = createContext();

export function useAuth() {
  return useContext(AuthContext);
}

export function AuthProvider({ children }) {
  const [currentUser, setCurrentUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (user) => {
      if (user) {
        // Fetch user role and other details from Firestore
        const userDocRef = doc(db, 'users', user.uid);
        const userDoc = await getDoc(userDocRef);
        if (userDoc.exists()) {
          const userData = userDoc.data();
          setCurrentUser({ 
            uid: user.uid, 
            email: user.email, 
            ...userData 
          });
          // Log login event only once per session
          if(sessionStorage.getItem('loginEventLogged') !== 'true') {
            await logAuditEvent('User Logged In', { userId: user.uid, email: user.email });
            sessionStorage.setItem('loginEventLogged', 'true');
          }
        } else {
          setCurrentUser(user);
        }
      } else {
        setCurrentUser(null);
      }
      setLoading(false);
    });

    return unsubscribe;
  }, []);

  const logout = async () => {
    if (currentUser) {
        await logAuditEvent('User Logged Out', { userId: currentUser.uid, email: currentUser.email });
        sessionStorage.removeItem('loginEventLogged');
    }
    await signOut(auth);
  };

  const value = {
    currentUser,
    logout,
  };

  return (
    <AuthContext.Provider value={value}>
      {!loading && children}
    </AuthContext.Provider>
  );
}