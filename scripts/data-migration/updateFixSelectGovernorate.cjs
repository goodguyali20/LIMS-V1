// Usage: node updateFixSelectGovernorate.cjs
// This script will scan Firestore for patient registration settings and fix the typo 'selectgovernante' to 'selectGovernorate'.

const admin = require('firebase-admin');
const serviceAccount = require('./smartlab-lims-firebase-adminsdk-fbsvc-c387b74246.json');

admin.initializeApp({
  credential: admin.credential.cert(serviceAccount)
});

const db = admin.firestore();

async function fixSelectGovernorateTypo() {
  const settingsRef = db.collection('settings');
  const snapshot = await settingsRef.get();
  let updated = 0;

  for (const doc of snapshot.docs) {
    const data = doc.data();
    let changed = false;

    // Check for patientRegistrationFields
    if (data.patientRegistrationFields) {
      const fields = data.patientRegistrationFields;
      for (const key of Object.keys(fields)) {
        if (typeof fields[key] === 'object') {
          for (const subKey of Object.keys(fields[key])) {
            if (subKey === 'selectgovernante') {
              fields[key]['selectGovernorate'] = fields[key][subKey];
              delete fields[key][subKey];
              changed = true;
              console.log(`Fixed typo in document ${doc.id} under patientRegistrationFields.${key}`);
            }
          }
        }
      }
    }

    // Also check top-level keys
    if (data.selectgovernante) {
      data.selectGovernorate = data.selectgovernante;
      delete data.selectgovernante;
      changed = true;
      console.log(`Fixed typo in document ${doc.id} at top level`);
    }

    if (changed) {
      await doc.ref.update(data);
      updated++;
    }
  }

  console.log(`Update complete. ${updated} document(s) updated.`);
}

fixSelectGovernorateTypo().catch(console.error); 