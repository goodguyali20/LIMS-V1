// Usage: node fixDefaultLocationValues.cjs
// This script will fix any defaultLocation values in Firestore that are set to translation keys.

const admin = require('firebase-admin');
const serviceAccount = require('./smartlab-lims-firebase-adminsdk-fbsvc-c387b74246.json');

admin.initializeApp({
  credential: admin.credential.cert(serviceAccount)
});

const db = admin.firestore();

async function fixDefaultLocationValues() {
  const settingsRef = db.collection('settings');
  const snapshot = await settingsRef.get();
  let updated = 0;

  for (const doc of snapshot.docs) {
    const data = doc.data();
    let changed = false;
    
    if (data.patientRegistrationFields && data.patientRegistrationFields.defaultLocation) {
      const defaultLocation = data.patientRegistrationFields.defaultLocation;
      
      // Fix governorate value
      if (defaultLocation.governorate && defaultLocation.governorate.value && 
          defaultLocation.governorate.value.startsWith('patientRegistration.')) {
        defaultLocation.governorate.value = '';
        changed = true;
        console.log(`Fixed governorate value in document ${doc.id}`);
      }
      
      // Fix district value
      if (defaultLocation.district && defaultLocation.district.value && 
          defaultLocation.district.value.startsWith('patientRegistration.')) {
        defaultLocation.district.value = '';
        changed = true;
        console.log(`Fixed district value in document ${doc.id}`);
      }
      
      // Fix area value
      if (defaultLocation.area && defaultLocation.area.value && 
          defaultLocation.area.value.startsWith('patientRegistration.')) {
        defaultLocation.area.value = '';
        changed = true;
        console.log(`Fixed area value in document ${doc.id}`);
      }
    }
    
    if (changed) {
      await doc.ref.update(data);
      updated++;
    }
  }
  
  console.log(`Default location values fix complete. ${updated} document(s) updated.`);
}

fixDefaultLocationValues().catch(console.error); 