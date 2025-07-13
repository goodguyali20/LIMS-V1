// Import necessary tools
import { initializeApp } from "firebase/app";
import { getFirestore, writeBatch, collection, getDocs, doc } from "firebase/firestore";
import dotenv from 'dotenv';

// Load environment variables from .env.local
dotenv.config({ path: '.env.local' });

// Firebase configuration
const firebaseConfig = {
  apiKey: import.meta.env.VITE_FIREBASE_API_KEY,
  authDomain: import.meta.env.VITE_FIREBASE_AUTH_DOMAIN,
  projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID,
  storageBucket: import.meta.env.VITE_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID,
  appId: import.meta.env.VITE_FIREBASE_APP_ID,
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const db = getFirestore(app);

// --- The complete test catalog from your reports ---
const allLabTests = [
  // Chemistry
  { name: "Blood Sugar", department: "Chemistry", unit: "mg/dL", normalRange: "70 - 120" },
  { name: "Urea", department: "Chemistry", unit: "mg/dL", normalRange: "15 - 45" },
  { name: "Creatinine", department: "Chemistry", unit: "mg/dL", normalRange: "0.7 - 1.3" },
  { name: "Potassium", department: "Chemistry", unit: "mg/dL", normalRange: "3.5 - 5.3" },
  { name: "Uric Acid", department: "Chemistry", unit: "mg/dL", normalRange: "3 - 7" },
  { name: "Cholesterol", department: "Chemistry", unit: "mg/dL", normalRange: "Less than 200" },
  { name: "Triglyceride", department: "Chemistry", unit: "mg/dL", normalRange: "60 - 165" },
  { name: "HDL-Cholesterol", department: "Chemistry", unit: "mg/dL", normalRange: "30 - 63" },
  { name: "LDL-Cholesterol", department: "Chemistry", unit: "mg/dL", normalRange: "0 - 130" },
  { name: "VLDL", department: "Chemistry", unit: "mg/dL", normalRange: "12 - 38" },
  { name: "Total Protein", department: "Chemistry", unit: "g/dL", normalRange: "6 - 8" },
  { name: "Albumin", department: "Chemistry", unit: "g/dL", normalRange: "3.6 - 5.2" },
  { name: "Iron", department: "Chemistry", unit: "ug/dL", normalRange: "50 - 170" },
  { name: "Total Bilirubin", department: "Chemistry", unit: "mg/dL", normalRange: "0.2 - 1" },
  { name: "Direct Bilirubin", department: "Chemistry", unit: "mg/dL", normalRange: "< 0.2" },
  { name: "Indirect Bilirubin", department: "Chemistry", unit: "mg/dL", normalRange: "< 0.7" },
  { name: "ALK. Phosphatase", department: "Chemistry", unit: "U/L", normalRange: "53 - 128" },
  { name: "AST (GOT)", department: "Chemistry", unit: "U/L", normalRange: "Up to 40" },
  { name: "ALT (GPT)", department: "Chemistry", unit: "U/L", normalRange: "Up to 40" },
  { name: "Calcium", department: "Chemistry", unit: "mg/dL", normalRange: "8.6 - 10" },
  { name: "Hb A1c", department: "Chemistry", unit: "%", normalRange: "" },
  
  // Hematology
  { name: "CBC", department: "Hematology", unit: "", normalRange: "" },
  { name: "PT / INR", department: "Hematology", unit: "", normalRange: "" },
  { name: "aPTT", department: "Hematology", unit: "", normalRange: "" },
  { name: "Bleeding Time (BT)", department: "Hematology", unit: "min", normalRange: "" },
  { name: "Clotting Time (CT)", department: "Hematology", unit: "min", normalRange: "" },

  // Serology
  { name: "Widal Test", department: "Serology", unit: "", normalRange: "Negative" },
  { name: "Rose Bengal Test", department: "Serology", unit: "", normalRange: "Negative" },
  { name: "CRP (C. Reactive Protein)", department: "Serology", unit: "", normalRange: "Negative" },
  { name: "RF (Latex Fixation)", department: "Serology", unit: "", normalRange: "Negative" },
  { name: "ASO Titer", department: "Serology", unit: "IU/mL", normalRange: "< 200" },
  { name: "Pregnancy Test (HCG)", department: "Serology", unit: "", normalRange: "Negative" },

  // Virology
  { name: "HBsAg", department: "Virology", unit: "", normalRange: "Negative" },
  { name: "Anti-HCV", department: "Virology", unit: "", normalRange: "Negative" },
  { name: "HIV (Ag/Ab Combo)", department: "Virology", unit: "", normalRange: "Negative" },
  { name: "Anti-HAV IgM", department: "Virology", unit: "", normalRange: "Negative" },
  { name: "Anti-HEV IgM", department: "Virology", unit: "", normalRange: "Negative" },
  { name: "Toxoplasma IgM", department: "Virology", unit: "", normalRange: "Negative" },
  { name: "Toxoplasma IgG", department: "Virology", unit: "", normalRange: "Negative" },
  { name: "CMV IgG", department: "Virology", unit: "", normalRange: "Negative" },
  { name: "Rubella IgM", department: "Virology", unit: "", normalRange: "Negative" },
  { name: "V.D.R.L Test", department: "Virology", unit: "", normalRange: "Non-Reactive" },

  // Microbiology / General
  { name: "GUE (Urine Examination)", department: "General", unit: "", normalRange: "" },
  { name: "GSE (Stool Examination)", department: "General", unit: "", normalRange: "" },
  { name: "Kala-azar DS", department: "General", unit: "", normalRange: "Negative" },
  { name: "Fungal Scraping", department: "General", unit: "", normalRange: "" },
  { name: "Leishmania Scraping", department: "General", unit: "", normalRange: "" },
];

async function seedTests() {
  const testsCollectionRef = collection(db, 'labTests');
  console.log("Checking for existing tests to delete...");

  const existingTestsSnapshot = await getDocs(testsCollectionRef);
  if (!existingTestsSnapshot.empty) {
    const deleteBatch = writeBatch(db);
    existingTestsSnapshot.docs.forEach(doc => {
      deleteBatch.delete(doc.ref);
    });
    await deleteBatch.commit();
    console.log(`${existingTestsSnapshot.size} existing tests deleted successfully.`);
  } else {
    console.log("No existing tests to delete.");
  }

  console.log(`Preparing to add ${allLabTests.length} new tests...`);
  const addBatch = writeBatch(db);
  allLabTests.forEach(test => {
    const newTestRef = doc(testsCollectionRef); 
    addBatch.set(newTestRef, test);
  });

  try {
    await addBatch.commit();
    console.log("✅✅✅ Lab test catalog has been successfully updated! ✅✅✅");
  } catch (error) {
    console.error("❌ Error updating test catalog: ", error);
  }
}

seedTests();