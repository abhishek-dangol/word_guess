import React, { createContext, useContext, useState } from 'react';

interface SettingsContextType {
  maxSkips: number;
  setMaxSkips: (count: number) => void;
  roundDuration: number;
  setRoundDuration: (seconds: number) => void;
}

const SettingsContext = createContext<SettingsContextType | undefined>(undefined);

export function SettingsProvider({ children }: { children: React.ReactNode }) {
  const [maxSkips, setMaxSkips] = useState(3);
  const [roundDuration, setRoundDuration] = useState(120); // Default 120 seconds

  return (
    <SettingsContext.Provider value={{ maxSkips, setMaxSkips, roundDuration, setRoundDuration }}>
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
