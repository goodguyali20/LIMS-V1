import { createContext } from 'react';

export const OrderContext = createContext({
  lastOrderId: null,
  setLastOrderId: () => {},
}); 