// Export Address Data Script
// Run this in your browser console to export your address data

import { doc, getDoc } from 'firebase/firestore';
import { db } from './src/firebase/config.js';

const exportAddressData = async () => {
  try {
    const docRef = doc(db, 'settings', 'general');
    const docSnap = await getDoc(docRef);
    
    if (docSnap.exists()) {
      const data = docSnap.data();
      const addressData = data.addressData;
      
      if (addressData) {
        // Create downloadable JSON file
        const dataStr = JSON.stringify(addressData, null, 2);
        const dataBlob = new Blob([dataStr], { type: 'application/json' });
        const url = URL.createObjectURL(dataBlob);
        
        const link = document.createElement('a');
        link.href = url;
        link.download = 'address-data-backup.json';
        link.click();
        
        URL.revokeObjectURL(url);
        console.log('Address data exported successfully!');
        console.log('Data:', addressData);
      } else {
        console.log('No address data found');
      }
    } else {
      console.log('Settings document not found');
    }
  } catch (error) {
    console.error('Error exporting address data:', error);
  }
};

// Run the export
exportAddressData(); 