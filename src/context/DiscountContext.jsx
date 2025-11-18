import { createContext, useContext, useState } from "react";

const DiscountContext = createContext();

export const DiscountProvider = ({ children }) => {
  const [discount, setDiscount] = useState(0); //porcentaje de descuento actual 
  const value = { discount, setDiscount };
  return (
    <DiscountContext.Provider value={value}>
      {children}
    </DiscountContext.Provider>
  );
};

export const useDiscount = () => useContext(DiscountContext);
