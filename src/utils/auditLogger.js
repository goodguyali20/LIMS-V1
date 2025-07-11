import { collection, addDoc, serverTimestamp } from 'firebase/firestore';
import { db } from '../firebase/config';

export const logAuditEvent = async (action, details) => {
  try {
    await addDoc(collection(db, 'auditLog'), {
      action,
      details,
      timestamp: serverTimestamp(),
    });
  } catch (error) {
    console.error("Error logging audit event:", error);
  }
};