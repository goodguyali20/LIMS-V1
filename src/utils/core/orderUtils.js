/**
 * Order utility functions for SmartLab LIMS
 */

/**
 * Generate a unique Order ID based on current date and sequence
 * Format: SL-YYYY-MM-DD-XXX where XXX is a sequential number
 */
export const generateOrderId = async (db) => {
  try {
    const today = new Date();
    const dateString = today.toISOString().split('T')[0]; // YYYY-MM-DD format
    const baseId = `SL-${dateString}`;
    
    // Query for existing orders today to get the next sequence number
    const { collection, query, where, orderBy, limit, getDocs } = await import('firebase/firestore');
    
    const todayStart = new Date(today.getFullYear(), today.getMonth(), today.getDate());
    const todayEnd = new Date(today.getFullYear(), today.getMonth(), today.getDate() + 1);
    
    const ordersQuery = query(
      collection(db, 'testOrders'),
      where('createdAt', '>=', todayStart),
      where('createdAt', '<', todayEnd),
      orderBy('createdAt', 'desc'),
      limit(1)
    );
    
    const querySnapshot = await getDocs(ordersQuery);
    
    let sequenceNumber = 1;
    if (!querySnapshot.empty) {
      // Get the last order number and increment
      const lastOrder = querySnapshot.docs[0].data();
      if (lastOrder.orderId && lastOrder.orderId.startsWith(baseId)) {
        const lastSequence = parseInt(lastOrder.orderId.split('-').pop());
        sequenceNumber = lastSequence + 1;
      }
    }
    
    // Format sequence number with leading zeros (001, 002, etc.)
    const formattedSequence = sequenceNumber.toString().padStart(3, '0');
    return `${baseId}-${formattedSequence}`;
    
  } catch (error) {
    console.error('Error generating Order ID:', error);
    // Fallback to timestamp-based ID
    return `SL-${Date.now()}`;
  }
};

/**
 * Create a new test order in the database
 */
export const createTestOrder = async (db, orderData) => {
  try {
    const { addDoc, collection } = await import('firebase/firestore');
    
    const orderDoc = await addDoc(collection(db, 'testOrders'), {
      ...orderData,
      createdAt: new Date(),
      status: 'pending',
      updatedAt: new Date()
    });
    
    return {
      id: orderDoc.id,
      orderId: orderData.orderId,
      ...orderData
    };
    
  } catch (error) {
    console.error('Error creating test order:', error);
    throw error;
  }
};
