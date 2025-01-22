import React, { createContext, useContext, useState } from 'react';

interface SettingsContextType {
  maxSkips: number;
  setMaxSkips: (count: number) => void;
}

const SettingsContext = createContext<SettingsContextType | undefined>(undefined);

export function SettingsProvider({ children }: { children: React.ReactNode }) {
  const [maxSkips, setMaxSkips] = useState(3); // Default value

  return (
    <SettingsContext.Provider value={{ maxSkips, setMaxSkips }}>
      {children}
    </SettingsContext.Provider>
  );
}

export function useSettings() {
  const context = useContext(SettingsContext);
  if (context === undefined) {
    throw new Error('useSettings must be used within a SettingsProvider');
  }
  return context;
}
