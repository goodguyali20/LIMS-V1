// Import necessary tools
import { initializeApp } from "firebase/app";
import { getFirestore, writeBatch, collection, getDocs, doc } from "firebase/firestore";
import dotenv from 'dotenv';

// Load environment variables from .env.local
dotenv.config({ path: '.env.local' });

// Firebase configuration
const firebaseConfig = {
  apiKey: process.env.VITE_FIREBASE_API_KEY,
  authDomain: process.env.VITE_FIREBASE_AUTH_DOMAIN,
  projectId: process.env.VITE_FIREBASE_PROJECT_ID,
  storageBucket: process.env.VITE_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: process.env.VITE_FIREBASE_MESSAGING_SENDER_ID,
  appId: process.env.VITE_FIREBASE_APP_ID,
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const db = getFirestore(app);

// --- The complete test catalog from your reports ---
const allLabTests = [
  // Chemistry
  { name: "Blood Sugar", department: "Chemistry", unit: "mg/dL", normalRange: "70 - 120", subsection: "Blood Sugar Tests" },
  { name: "Urea", department: "Chemistry", unit: "mg/dL", normalRange: "15 - 45", subsection: "Kidney Function Tests" },
  { name: "Creatinine", department: "Chemistry", unit: "mg/dL", normalRange: "0.7 - 1.3", subsection: "Kidney Function Tests" },
  { name: "Potassium", department: "Chemistry", unit: "mg/dL", normalRange: "3.5 - 5.3", subsection: "General Chemistry" },
  { name: "Uric Acid", department: "Chemistry", unit: "mg/dL", normalRange: "3 - 7", subsection: "General Chemistry" },
  { name: "Cholesterol", department: "Chemistry", unit: "mg/dL", normalRange: "Less than 200", subsection: "Lipid Profile" },
  { name: "Triglyceride", department: "Chemistry", unit: "mg/dL", normalRange: "60 - 165", subsection: "Lipid Profile" },
  { name: "HDL-Cholesterol", department: "Chemistry", unit: "mg/dL", normalRange: "30 - 63", subsection: "Lipid Profile" },
  { name: "LDL-Cholesterol", department: "Chemistry", unit: "mg/dL", normalRange: "0 - 130", subsection: "Lipid Profile" },
  { name: "VLDL", department: "Chemistry", unit: "mg/dL", normalRange: "12 - 38", subsection: "Lipid Profile" },
  { name: "Total Protein", department: "Chemistry", unit: "g/dL", normalRange: "6 - 8", subsection: "General Chemistry" },
  { name: "Albumin", department: "Chemistry", unit: "g/dL", normalRange: "3.6 - 5.2", subsection: "Liver Function Tests" },
  { name: "Iron", department: "Chemistry", unit: "ug/dL", normalRange: "50 - 170", subsection: "General Chemistry" },
  { name: "Total Bilirubin", department: "Chemistry", unit: "mg/dL", normalRange: "0.2 - 1", subsection: "Liver Function Tests" },
  { name: "Direct Bilirubin", department: "Chemistry", unit: "mg/dL", normalRange: "< 0.2", subsection: "Liver Function Tests" },
  { name: "Indirect Bilirubin", department: "Chemistry", unit: "mg/dL", normalRange: "< 0.7", subsection: "Liver Function Tests" },
  { name: "ALK. Phosphatase", department: "Chemistry", unit: "U/L", normalRange: "53 - 128", subsection: "Liver Function Tests" },
  { name: "AST (GOT)", department: "Chemistry", unit: "U/L", normalRange: "Up to 40", subsection: "Liver Function Tests" },
  { name: "ALT (GPT)", department: "Chemistry", unit: "U/L", normalRange: "Up to 40", subsection: "Liver Function Tests" },
  { name: "Calcium", department: "Chemistry", unit: "mg/dL", normalRange: "8.6 - 10", subsection: "General Chemistry" },
  { name: "Hb A1c", department: "Chemistry", unit: "%", normalRange: "", subsection: "Blood Sugar Tests" },

  // Hematology
  { name: "CBC", department: "Hematology", unit: "", normalRange: "", subsection: "Basic Hematology" },
  { name: "PT / INR", department: "Hematology", unit: "", normalRange: "", subsection: "Coagulation Profile" },
  { name: "aPTT", department: "Hematology", unit: "", normalRange: "", subsection: "Coagulation Profile" },
  { name: "Bleeding Time (BT)", department: "Hematology", unit: "min", normalRange: "", subsection: "Basic Hematology" },
  { name: "Clotting Time (CT)", department: "Hematology", unit: "min", normalRange: "", subsection: "Basic Hematology" },

  // Serology
  { name: "Widal Test", department: "Serology", unit: "", normalRange: "Negative", subsection: "Agglutination Tests" },
  { name: "Rose Bengal Test", department: "Serology", unit: "", normalRange: "Negative", subsection: "Agglutination Tests" },
  { name: "CRP (C. Reactive Protein)", department: "Serology", unit: "", normalRange: "Negative", subsection: "General Serology" },
  { name: "RF (Latex Fixation)", department: "Serology", unit: "", normalRange: "Negative", subsection: "General Serology" },
  { name: "ASO Titer", department: "Serology", unit: "IU/mL", normalRange: "< 200", subsection: "Strep Tests" },
  { name: "Pregnancy Test (HCG)", department: "Serology", unit: "", normalRange: "Negative", subsection: "General Serology" },

  // Virology
  { name: "HBsAg", department: "Virology", unit: "", normalRange: "Negative", subsection: "General Virology" },
  { name: "Anti-HCV", department: "Virology", unit: "", normalRange: "Negative", subsection: "General Virology" },
  { name: "HIV (Ag/Ab Combo)", department: "Virology", unit: "", normalRange: "Negative", subsection: "General Virology" },
  { name: "Anti-HAV IgM", department: "Virology", unit: "", normalRange: "Negative", subsection: "General Virology" },
  { name: "Anti-HEV IgM", department: "Virology", unit: "", normalRange: "Negative", subsection: "General Virology" },
  { name: "Toxoplasma IgM", department: "Virology", unit: "", normalRange: "Negative", subsection: "General Virology" },
  { name: "Toxoplasma IgG", department: "Virology", unit: "", normalRange: "Negative", subsection: "General Virology" },
  { name: "CMV IgG", department: "Virology", unit: "", normalRange: "Negative", subsection: "General Virology" },
  { name: "Rubella IgM", department: "Virology", unit: "", normalRange: "Negative", subsection: "General Virology" },
  { name: "V.D.R.L Test", department: "Virology", unit: "", normalRange: "Non-Reactive", subsection: "General Virology" },

  // Microbiology / Parasitology
  { name: "GUE (Urine Examination)", department: "Parasitology", unit: "", normalRange: "", subsection: "General Microbiology" },
  { name: "GSE (Stool Examination)", department: "Parasitology", unit: "", normalRange: "", subsection: "General Microbiology" },
  { name: "Kala-azar DS", department: "Parasitology", unit: "", normalRange: "Negative", subsection: "General Microbiology" },
  { name: "Fungal Scraping", department: "Parasitology", unit: "", normalRange: "", subsection: "General Microbiology" },
  { name: "Leishmania Scraping", department: "Parasitology", unit: "", normalRange: "", subsection: "General Microbiology" },
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