import React, { createContext, useState, useMemo } from 'react';

// Create the context with a default value
export const OrderContext = createContext({
  lastOrderId: null,
  setLastOrderId: () => {},
});

// Create the provider component
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