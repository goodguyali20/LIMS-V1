// updateCityField.js
import { initializeApp } from 'firebase/app';
import { getFirestore, doc, getDoc, setDoc } from 'firebase/firestore';
import dotenv from 'dotenv';

dotenv.config({ path: '.env.local' });

const firebaseConfig = {
  apiKey: process.env.VITE_FIREBASE_API_KEY,
  authDomain: process.env.VITE_FIREBASE_AUTH_DOMAIN,
  projectId: process.env.VITE_FIREBASE_PROJECT_ID,
  storageBucket: process.env.VITE_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: process.env.VITE_FIREBASE_MESSAGING_SENDER_ID,
  appId: process.env.VITE_FIREBASE_APP_ID,
};

const app = initializeApp(firebaseConfig);
const db = getFirestore(app);

async function updateCityField() {
  const docRef = doc(db, 'settings', 'general');
  const docSnap = await getDoc(docRef);
  if (docSnap.exists()) {
    const data = docSnap.data();
    if (data.patientRegistrationFields?.address?.city) {
      data.patientRegistrationFields.address.city.enabled = false;
      data.patientRegistrationFields.address.city.required = false;
      await setDoc(docRef, data);
      console.log('City field updated!');
    } else {
      console.log('City field not found in settings.');
    }
  } else {
    console.log('Settings document not found.');
  }
}

updateCityField(); 