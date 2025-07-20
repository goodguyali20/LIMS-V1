// update_test_orders_with_full_tests.js
const { initializeApp, applicationDefault } = require('firebase-admin/app');
const { getFirestore } = require('firebase-admin/firestore');

initializeApp({
  credential: applicationDefault(),
});

const db = getFirestore();

async function main() {
  // Fetch all lab tests
  const labTestsSnap = await db.collection('labTests').get();
  const labTests = {};
  labTestsSnap.forEach(doc => {
    const data = doc.data();
    labTests[data.name] = { ...data, id: doc.id };
  });

  // Fetch all test orders
  const ordersSnap = await db.collection('testOrders').get();
  let updatedCount = 0;

  for (const orderDoc of ordersSnap.docs) {
    const order = orderDoc.data();
    let needsUpdate = false;
    let newTests = [];

    if (Array.isArray(order.tests)) {
      newTests = order.tests.map(test => {
        if (typeof test === 'string') {
          // Test is just a name, replace with full object
          const testObj = labTests[test];
          if (testObj) {
            needsUpdate = true;
            // Only include relevant fields
            return {
              id: testObj.id,
              name: testObj.name,
              department: testObj.department,
              price: testObj.price || 0,
              unit: testObj.unit || '',
              referenceRange: testObj.referenceRange || null,
            };
          } else {
            // Test not found, keep as is
            return test;
          }
        } else if (test && test.name && !test.department && labTests[test.name]) {
          // Test object missing department, patch it
          needsUpdate = true;
          const testObj = labTests[test.name];
          return {
            ...test,
            department: testObj.department,
            price: testObj.price || 0,
            unit: testObj.unit || '',
            referenceRange: testObj.referenceRange || null,
          };
        } else {
          // Already a full object
          return test;
        }
      });
    }

    if (needsUpdate) {
      await orderDoc.ref.update({ tests: newTests });
      updatedCount++;
      console.log(`Updated order ${orderDoc.id}`);
    }
  }

  console.log(`Done. Updated ${updatedCount} orders.`);
}

main().catch(err => {
  console.error('Error updating test orders:', err);
  process.exit(1);
}); 