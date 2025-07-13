import React, { useState, useMemo } from 'react';
import { OrderContext } from './OrderContextBase.js';

// Re-export OrderContext for direct imports
export { OrderContext };

export const OrderProvider = ({ children }) => {
  const [lastOrderId, setLastOrderId] = useState(null);

  // Memoize the context value to prevent unnecessary re-renders
  const value = useMemo(
    () => ({
      lastOrderId,
      setLastOrderId,
    }),
    [lastOrderId]
  );

  return <OrderContext.Provider value={value}>{children}</OrderContext.Provider>;
};