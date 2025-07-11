import { collection, addDoc, serverTimestamp } from 'firebase/firestore';
import { db, auth } from '../firebase';

export const logAction = async (action, details = {}) => {
  try {
    const currentUser = auth.currentUser;
    await addDoc(collection(db, 'auditLog'), {
      action: action,
      userId: currentUser ? currentUser.uid : 'System',
      userEmail: currentUser ? currentUser.email : 'System',
      timestamp: serverTimestamp(),
      details: details,
    });
  } catch (error) {
    console.error("Failed to log action:", error);
  }
};