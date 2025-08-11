const { initializeApp, applicationDefault } = require('firebase-admin/app');
const { getFirestore } = require('firebase-admin/firestore');

initializeApp({
  credential: applicationDefault(),
});

const db = getFirestore();

async function updateAddressFields() {
  const docRef = db.collection('settings').doc('general');
  const doc = await docRef.get();
  if (!doc.exists) {
    console.log('No settings/general document found.');
    return;
  }
  const data = doc.data();
  data.patientRegistrationFields.address = {
    governorate: { required: true, enabled: true, label: 'address.governorate' },
    district: { required: true, enabled: true, label: 'address.district' },
    area: { required: true, enabled: true, label: 'address.area' },
    landmark: { required: false, enabled: true, label: 'address.landmark' }
  };
  await docRef.set(data, { merge: true });
  console.log('Address fields updated to use translation keys!');
}

updateAddressFields(); 