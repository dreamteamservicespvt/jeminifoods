import React, { createContext, useContext } from 'react';
import { useResponsive, Responsive } from '../hooks/useResponsive';

// Create the context
export const ResponsiveContext = createContext<Responsive | null>(null);

// Provider component
export const ResponsiveProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const responsive = useResponsive();
  
  return (
    <ResponsiveContext.Provider value={responsive}>
      {children}
    </ResponsiveContext.Provider>
  );
};

// Custom hook for using the responsive context
export const useResponsiveContext = (): Responsive => {
  const context = useContext(ResponsiveContext);
  
  if (!context) {
    throw new Error('useResponsiveContext must be used within a ResponsiveProvider');
  }
  
  return context;
};
