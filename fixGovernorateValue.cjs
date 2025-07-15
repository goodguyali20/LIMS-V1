// Usage: node fixGovernorateValue.cjs
// This script will scan Firestore for patient registration settings and fix any defaultLocation.governorate.value set to 'patientRegistration.selectGovernorate'.

const admin = require('firebase-admin');
const serviceAccount = require('./smartlab-lims-firebase-adminsdk-fbsvc-c387b74246.json');

admin.initializeApp({
  credential: admin.credential.cert(serviceAccount)
});

const db = admin.firestore();

async function fixGovernorateValue() {
  const settingsRef = db.collection('settings');
  const snapshot = await settingsRef.get();
  let updated = 0;

  for (const doc of snapshot.docs) {
    const data = doc.data();
    let changed = false;
    if (data.patientRegistrationFields && data.patientRegistrationFields.defaultLocation) {
      if (
        data.patientRegistrationFields.defaultLocation.governorate &&
        data.patientRegistrationFields.defaultLocation.governorate.value === 'patientRegistration.selectGovernorate'
      ) {
        data.patientRegistrationFields.defaultLocation.governorate.value = '';
        changed = true;
        console.log(`Fixed governorate value in document ${doc.id}`);
      }
    }
    if (changed) {
      await doc.ref.update(data);
      updated++;
    }
  }
  console.log(`Governorate value fix complete. ${updated} document(s) updated.`);
}

fixGovernorateValue().catch(console.error); 