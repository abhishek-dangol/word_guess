import React, { createContext, useContext, useState } from 'react';

interface Settings {
  maxSkips: number;
  setMaxSkips: (count: number) => void;
  roundDuration: number;
  setRoundDuration: (seconds: number) => void;
  disqualificationRule: 'zero' | 'total';
  updateSettings: (key: keyof Settings, value: any) => void;
}

const SettingsContext = createContext<Settings | undefined>(undefined);

export function SettingsProvider({ children }: { children: React.ReactNode }) {
  const [settings, setSettings] = useState<Settings>({
    maxSkips: 3,
    roundDuration: 120,
    disqualificationRule: 'zero',
    setMaxSkips: (count: number) => setSettings((prev) => ({ ...prev, maxSkips: count })),
    setRoundDuration: (seconds: number) =>
      setSettings((prev) => ({ ...prev, roundDuration: seconds })),
    updateSettings: (key: keyof Settings, value: any) =>
      setSettings((prev) => ({ ...prev, [key]: value })),
  });

  return <SettingsContext.Provider value={settings}>{children}</SettingsContext.Provider>;
}

export function useSettings() {
  const context = useContext(SettingsContext);
  if (context === undefined) {
    throw new Error('useSettings must be used within a SettingsProvider');
  }
  return context;
}
