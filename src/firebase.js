import { initializeApp } from "firebase/app";
import { getAuth } from "firebase/auth";
import { getFirestore } from "firebase/firestore";

// Your web app's Firebase configuration
// The "export" keyword is now added here. This is the fix.
export const firebaseConfig = {
  apiKey: "AIzaSyDQCoKAtBcfq4ZMqNCW1uZRm_-Pbsenq3E",
  authDomain: "smartlab-lims.firebaseapp.com",
  projectId: "smartlab-lims",
  storageBucket: "smartlab-lims.appspot.com",
  messagingSenderId: "937322680561",
  appId: "1:937322680561:web:b460fc4c32346d71015950",
  measurementId: "G-5Y4FF95W4T"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);

// Initialize and export the Firebase services we need for the app
export const db = getFirestore(app);
export const auth = getAuth(app);