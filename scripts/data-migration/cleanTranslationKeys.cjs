// Usage: node cleanTranslationKeys.cjs
// This script will clean any translation keys from Firestore settings and ensure proper default values.

const admin = require('firebase-admin');
const serviceAccount = require('./smartlab-lims-firebase-adminsdk-fbsvc-c387b74246.json');

admin.initializeApp({
  credential: admin.credential.cert(serviceAccount)
});

const db = admin.firestore();

async function cleanTranslationKeys() {
  const settingsRef = db.collection('settings');
  const snapshot = await settingsRef.get();
  let updated = 0;

  for (const doc of snapshot.docs) {
    const data = doc.data();
    let changed = false;

    // Check and fix patientRegistrationFields
    if (data.patientRegistrationFields) {
      // Fix defaultLocation values
      if (data.patientRegistrationFields.defaultLocation) {
        const defaultLocation = data.patientRegistrationFields.defaultLocation;
        
        if (defaultLocation.governorate && defaultLocation.governorate.value && 
            defaultLocation.governorate.value.startsWith('patientRegistration.')) {
          defaultLocation.governorate.value = '';
          changed = true;
          console.log(`Fixed governorate value in document ${doc.id}`);
        }
        
        if (defaultLocation.district && defaultLocation.district.value && 
            defaultLocation.district.value.startsWith('patientRegistration.')) {
          defaultLocation.district.value = '';
          changed = true;
          console.log(`Fixed district value in document ${doc.id}`);
        }
        
        if (defaultLocation.area && defaultLocation.area.value && 
            defaultLocation.area.value.startsWith('patientRegistration.')) {
          defaultLocation.area.value = '';
          changed = true;
          console.log(`Fixed area value in document ${doc.id}`);
        }
      }

      // Fix any field values that might contain translation keys
      if (data.patientRegistrationFields.fields) {
        Object.keys(data.patientRegistrationFields.fields).forEach(sectionKey => {
          const section = data.patientRegistrationFields.fields[sectionKey];
          if (section && typeof section === 'object') {
            Object.keys(section).forEach(fieldKey => {
              const field = section[fieldKey];
              if (field && field.value && typeof field.value === 'string' && 
                  field.value.startsWith('patientRegistration.')) {
                field.value = '';
                changed = true;
                console.log(`Fixed field value ${sectionKey}.${fieldKey} in document ${doc.id}`);
              }
            });
          }
        });
      }
    }

    if (changed) {
      await doc.ref.update(data);
      updated++;
    }
  }

  console.log(`Translation keys cleanup complete. ${updated} document(s) updated.`);
  process.exit(0);
}

cleanTranslationKeys().catch(console.error); 