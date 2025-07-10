import { initializeApp } from "firebase/app";
import { getAuth, createUserWithEmailAndPassword } from "firebase/auth";
import { getFirestore, collection, doc, setDoc, addDoc, Timestamp } from "firebase/firestore";
import { firebaseConfig } from "./firebase.js"; // Import your actual config

// --- SCRIPT CONFIGURATION ---
const NUM_PATIENTS = 20;
const NUM_ORDERS = 35;

// --- SAMPLE DATA ---
const usersToCreate = [
    { email: 'manager@lab.com', password: 'password123', role: 'manager' },
    { email: 'reception@lab.com', password: 'password123', role: 'receptionist' },
    { email: 'phleb@lab.com', password: 'password123', role: 'phlebotomist' },
    { email: 'tech@lab.com', password: 'password123', role: 'technologist' },
];

const testsToCreate = [
    { name: 'Glucose', unit: 'mg/dL', refRangeLow: 70, refRangeHigh: 100, criticalLow: 50, criticalHigh: 400 },
    { name: 'Urea', unit: 'mg/dL', refRangeLow: 15, refRangeHigh: 45, criticalLow: 5, criticalHigh: 100 },
    { name: 'Creatinine', unit: 'mg/dL', refRangeLow: 0.6, refRangeHigh: 1.2, criticalLow: 0.3, criticalHigh: 5 },
    { name: 'TSH', unit: 'mIU/L', refRangeLow: 0.4, refRangeHigh: 4.0, criticalLow: 0.1, criticalHigh: 10 },
    { name: 'HBsAg', unit: 'Qualitative', refRangeLow: null, refRangeHigh: null, criticalLow: null, criticalHigh: null },
    { name: 'Vitamin D', unit: 'ng/mL', refRangeLow: 30, refRangeHigh: 100, criticalLow: 10, criticalHigh: null },
];

const maleNames = ['علي حسين', 'محمد كريم', 'احمد جاسم', 'حسن علي', 'يوسف خالد', 'عمر سعد', 'مصطفى وليد', 'ابراهيم احمد'];
const femaleNames = ['فاطمة علي', 'زينب احمد', 'مريم حسن', 'نور محمد', 'سارة خالد', 'هبة الله عامر', 'آية محمود', 'اسراء علي'];

// --- INITIALIZE FIREBASE ---
const app = initializeApp(firebaseConfig);
const auth = getAuth(app);
const db = getFirestore(app);

console.log("Firebase Initialized for Seeding.");

// --- HELPER FUNCTIONS ---
const getRandomElement = (arr) => arr[Math.floor(Math.random() * arr.length)];
const getRandomDate = (start, end) => new Date(start.getTime() + Math.random() * (end.getTime() - start.getTime()));
const getResultFlag = (def, value) => {
    if (!def || value === '' || def.unit === 'Qualitative') return 'Normal';
    const numValue = Number(value);
    if (isNaN(numValue)) return 'Invalid';
    if (def.criticalLow && numValue <= def.criticalLow) return 'Critical Low';
    if (def.criticalHigh && numValue >= def.criticalHigh) return 'Critical High';
    if (def.refRangeLow && numValue < def.refRangeLow) return 'Low';
    if (def.refRangeHigh && numValue > def.refRangeHigh) return 'High';
    return 'Normal';
};
const generateResultValue = (def) => {
    if (def.unit === 'Qualitative') return getRandomElement(['Positive', 'Negative']);
    const chance = Math.random();
    if (chance < 0.7) { // 70% chance of normal result
        return (Math.random() * (def.refRangeHigh - def.refRangeLow) + def.refRangeLow).toFixed(1);
    } else if (chance < 0.9) { // 20% chance of high/low
        return (Math.random() * (def.refRangeHigh * 1.5 - def.refRangeLow * 0.5) + def.refRangeLow * 0.5).toFixed(1);
    } else { // 10% chance of critical
        const critValue = def.criticalHigh ? def.criticalHigh * 1.2 : def.criticalLow * 0.5;
        return critValue.toFixed(1);
    }
};

// --- SEEDING LOGIC ---
async function seedDatabase() {
    console.log("--- Starting Database Seed ---");

    // 1. Create Users
    console.log("\n1. Creating users...");
    for (const user of usersToCreate) {
        try {
            const userCredential = await createUserWithEmailAndPassword(auth, user.email, user.password);
            const uid = userCredential.user.uid;
            await setDoc(doc(db, "users", uid), { email: user.email, role: user.role });
            console.log(`- Created user: ${user.email} (${user.role})`);
        } catch (error) {
            if (error.code === 'auth/email-already-in-use') {
                console.log(`- User ${user.email} already exists. Skipping.`);
            } else {
                console.error(`- Error creating user ${user.email}:`, error.message);
            }
        }
    }

    // 2. Create Lab Tests
    console.log("\n2. Creating lab tests...");
    const testIds = {};
    for (const test of testsToCreate) {
        const docRef = await addDoc(collection(db, "labTests"), test);
        testIds[test.name] = docRef.id;
        console.log(`- Created test: ${test.name}`);
    }

    // 3. Create Patients
    console.log("\n3. Creating patients...");
    const patientIds = [];
    for (let i = 0; i < NUM_PATIENTS; i++) {
        const gender = Math.random() > 0.5 ? 'Male' : 'Female';
        const name = gender === 'Male' ? getRandomElement(maleNames) : getRandomElement(femaleNames);
        const dob = getRandomDate(new Date(1950, 0, 1), new Date(2010, 0, 1)).toISOString().split('T')[0];
        const docRef = await addDoc(collection(db, "patients"), {
            name,
            gender,
            dob,
            registeredAt: Timestamp.fromDate(getRandomDate(new Date(2025, 6, 1), new Date())),
            registeredBy: "seed_script"
        });
        patientIds.push({id: docRef.id, name});
        console.log(`- Created patient: ${name}`);
    }

    // 4. Create Orders and Results
    console.log("\n4. Creating orders and results...");
    const statuses = ['registered', 'sample_collected', 'processing', 'pending_verification', 'verified'];
    for (let i = 0; i < NUM_ORDERS; i++) {
        const patient = getRandomElement(patientIds);
        const numTests = Math.floor(Math.random() * 4) + 1;
        const testsForOrder = [...testsToCreate].sort(() => 0.5 - Math.random()).slice(0, numTests);
        const status = getRandomElement(statuses);
        
        const orderRef = await addDoc(collection(db, "testOrders"), {
            patientId: patient.id,
            patientName: patient.name,
            tests: testsForOrder.map(t => t.name),
            status: status,
            createdAt: Timestamp.fromDate(getRandomDate(new Date(2025, 6, 3), new Date())),
        });
        console.log(`- Created order for ${patient.name} with status: ${status}`);

        // Create results for completed orders
        if (status === 'pending_verification' || status === 'verified') {
            const results = {};
            for (const testDef of testsForOrder) {
                const value = generateResultValue(testDef);
                const flag = getResultFlag(testDef, value);
                results[testDef.name] = { value, flag, unit: testDef.unit };
            }
            await addDoc(collection(db, "testResults"), {
                orderId: orderRef.id,
                patientId: patient.id,
                results: results,
                status: status,
                enteredAt: Timestamp.now(),
                enteredBy: "seed_script"
            });
            console.log(`  - Added results for order ${orderRef.id}`);
        }
    }

    console.log("\n--- Seed Complete! ---");
}

// Run the seeder
seedDatabase().catch(console.error);