// Import necessary tools
import { initializeApp } from "firebase/app";
import { getFirestore, writeBatch, doc, collection, Timestamp } from "firebase/firestore";
import dotenv from 'dotenv';

// Load environment variables from .env.local
dotenv.config({ path: '.env.local' });

// Your web app's Firebase configuration, loaded from environment variables
const firebaseConfig = {
  apiKey: import.meta.env.VITE_FIREBASE_API_KEY,
  authDomain: import.meta.env.VITE_FIREBASE_AUTH_DOMAIN,
  projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID,
  storageBucket: import.meta.env.VITE_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID,
  appId: import.meta.env.VITE_FIREBASE_APP_ID,
};

// --- DEBUGGING STEP ---
console.log("Firebase Config Object:", firebaseConfig);
// --------------------

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const db = getFirestore(app);

// --- DEBUGGING STEP ---
console.log("Firestore DB Object:", db ? "Exists" : "Is Undefined");
// --------------------

const batch = writeBatch(db);

async function seedDatabase() {
  console.log("Starting SmartLab data seeding from VS Code...");

  // --- 1. USERS ---
  const users = [{
    id: "manager01",
    email: "manager@smartlab.com",
    displayName: "Ali Hassan",
    role: "Manager"
  }, {
    id: "tech01",
    email: "tech1@smartlab.com",
    displayName: "Fatima Ahmed",
    role: "Technician"
  }, {
    id: "tech02",
    email: "tech2@smartlab.com",
    displayName: "Yusuf Ibrahim",
    role: "Technician"
  }, ];
  console.log("Preparing users...");
  users.forEach(user => {
    const ref = doc(db, "users", user.id);
    batch.set(ref, {
      email: user.email,
      displayName: user.displayName,
      role: user.role
    });
  });

  // --- 2. CRITICAL RANGES ---
  const criticalRanges = {
    "Glucose": { low: 50, high: 400 },
    "Potassium": { low: 2.5, high: 6.5 },
    "WBC": { low: 2.0, high: 25.0 },
  };
  console.log("Preparing critical ranges...");
  Object.keys(criticalRanges).forEach(test => {
    const ref = doc(db, "criticalRanges", test);
    batch.set(ref, criticalRanges[test]);
  });

  // --- 3. INVENTORY ---
  const inventoryItems = [{
    id: "GLUC-R-100",
    name: "Glucose Reagent Kit",
    manufacturer: "Roche",
    lowStockThreshold: 10
  }, {
    id: "K-R-50",
    name: "Potassium Reagent Kit",
    manufacturer: "Abbott",
    lowStockThreshold: 5
  }, ];
  console.log("Preparing inventory items...");
  inventoryItems.forEach(item => {
    const ref = doc(db, "inventoryItems", item.id);
    batch.set(ref, {
      name: item.name,
      manufacturer: item.manufacturer,
      lowStockThreshold: item.lowStockThreshold,
      createdAt: Timestamp.now()
    });
  });

  // --- 4. INVENTORY LOTS ---
  const inventoryLots = [{
    itemId: "GLUC-R-100",
    lotNumber: "GR-2025-A",
    quantity: 5, // LOW STOCK
    expiryDate: new Date("2026-12-31")
  }, {
    itemId: "K-R-50",
    lotNumber: "KR-2025-B",
    quantity: 20,
    expiryDate: new Date(new Date().setDate(new Date().getDate() + 15)) // EXPIRING SOON
  }, {
    itemId: "K-R-50",
    lotNumber: "KR-2025-C",
    quantity: 50,
    expiryDate: new Date("2027-01-31")
  }, ];
  console.log("Preparing inventory lots...");
  inventoryLots.forEach(lot => {
    const ref = doc(collection(db, `inventoryItems/${lot.itemId}/lots`));
    batch.set(ref, {
      lotNumber: lot.lotNumber,
      quantity: lot.quantity,
      expiryDate: Timestamp.fromDate(lot.expiryDate),
      createdAt: Timestamp.now()
    });
  });

  // --- 5. TEST ORDERS ---
  const patients = ["Mohammed Ali", "Aya Khalid", "Omar Saad", "Nour Hussein", "Layla Faisal"];
  const doctors = ["Dr. Abbas", "Dr. Zaynab", "Dr. Mariam"];
  
  const ordersToCreate = [{
    id: "ORDER001",
    patientName: patients[0],
    referringDoctor: doctors[0],
    tests: ["Glucose", "Hemoglobin"],
    priority: "Normal",
    status: "Completed",
    createdAt: Timestamp.fromDate(new Date(new Date().setDate(new Date().getDate() - 20))),
    completedBy: "tech1@smartlab.com",
    verifiedBy: "tech1@smartlab.com",
    results: { "Glucose": 95, "Hemoglobin": 14.2 }
  }, {
    id: "ORDER002",
    patientName: patients[1],
    referringDoctor: doctors[1],
    tests: ["Glucose"],
    priority: "Urgent",
    status: "Completed",
    createdAt: Timestamp.fromDate(new Date(new Date().setDate(new Date().getDate() - 15))),
    completedBy: "tech2@smartlab.com",
    verifiedBy: "tech2@smartlab.com",
    results: { "Glucose": 450 }
  }, {
    id: "ORDER003",
    patientName: patients[2],
    referringDoctor: doctors[0],
    tests: ["Potassium", "WBC"],
    priority: "Normal",
    status: "Rejected",
    createdAt: Timestamp.fromDate(new Date(new Date().setDate(new Date().getDate() - 10))),
    rejectionDetails: {
      reason: "Sample Hemolyzed",
      notes: "Sample was visibly red.",
      rejectedBy: "tech1@smartlab.com",
      rejectedAt: Timestamp.fromDate(new Date(new Date().setDate(new Date().getDate() - 9)))
    }
  }, {
    id: "ORDER004",
    patientName: patients[3],
    referringDoctor: doctors[2],
    tests: ["WBC"],
    priority: "Normal",
    status: "Amended",
    createdAt: Timestamp.fromDate(new Date(new Date().setDate(new Date().getDate() - 5))),
    completedBy: "tech2@smartlab.com",
    verifiedBy: "manager@smartlab.com",
    results: { "WBC": 8.5 },
    amendments: [{
      test: "WBC",
      originalResult: 5.8,
      amendedResult: 8.5,
      reason: "Clerical error during transcription.",
      amendedBy: "manager@smartlab.com",
      amendedAt: Timestamp.fromDate(new Date(new Date().setDate(new Date().getDate() - 4)))
    }]
  }, {
    id: "ORDER005",
    patientName: patients[4],
    referringDoctor: doctors[1],
    tests: ["Platelet"],
    priority: "Normal",
    status: "In Progress",
    createdAt: Timestamp.fromDate(new Date(new Date().setDate(new Date().getDate() - 1)))
  }, {
    id: "ORDER006",
    patientName: patients[0],
    referringDoctor: doctors[2],
    tests: ["Glucose", "Potassium", "WBC"],
    priority: "Normal",
    status: "Completed",
    createdAt: Timestamp.fromDate(new Date(new Date().setDate(new Date().getDate() - 2))),
    completedBy: "tech1@smartlab.com",
    verifiedBy: "tech1@smartlab.com",
    results: { "Glucose": 110, "Potassium": 4.1, "WBC": 7.2 }
  }, ];
  console.log("Preparing test orders...");
  ordersToCreate.forEach(order => {
    const ref = doc(db, "testOrders", order.id);
    batch.set(ref, order);
  });

  // --- 6. AUDIT LOG ---
  const auditLog = [{
    action: "User Logged In",
    details: { userId: "manager01", email: "manager@smartlab.com" }
  }, {
    action: "Sample Rejected",
    details: { orderId: "ORDER003", reason: "Sample Hemolyzed" }
  }, {
    action: "Report Amended",
    details: { orderId: "ORDER004", reason: "Clerical error during transcription." }
  }, {
    action: "Critical Value Acknowledged",
    details: { orderId: "ORDER002", test: "Glucose", value: 450 }
  }, ];
  console.log("Preparing audit log...");
  auditLog.forEach(log => {
    const ref = doc(collection(db, 'auditLog'));
    batch.set(ref, { ...log, timestamp: Timestamp.now() });
  });

  // --- Commit all writes to Firestore ---
  try {
    await batch.commit();
    console.log("✅✅✅ SmartLab data seeding complete! ✅✅✅");
  } catch (error) {
    console.error("❌ Error writing batch: ", error);
  }
}

seedDatabase();