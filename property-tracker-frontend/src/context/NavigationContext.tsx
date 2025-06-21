import { createContext, useContext, useState } from 'react';
import type { ReactNode } from 'react';

type NavigationContextType = {
  currentView: 'dashboard' | 'map' | 'list';
  setCurrentView: (view: 'dashboard' | 'map' | 'list') => void;
};

const NavigationContext = createContext<NavigationContextType | undefined>(undefined);

export const NavigationProvider = ({ children }: { children: ReactNode }) => {
  const [currentView, setCurrentView] = useState<'dashboard' | 'map' | 'list'>('map');
  
  return (
    <NavigationContext.Provider value={{ currentView, setCurrentView }}>
      {children}
    </NavigationContext.Provider>
  );
};

export const useNavigation = () => {
  const context = useContext(NavigationContext);
  if (context === undefined) {
    throw new Error('useNavigation must be used within a NavigationProvider');
  }
  return context;
};