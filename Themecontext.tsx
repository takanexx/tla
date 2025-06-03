// ThemeContext.tsx
import { Theme } from '@react-navigation/native';
import { useQuery } from '@realm/react';
import React, { createContext, ReactNode, useContext, useState } from 'react';
import { DarkTheme, LightTheme } from './constants/theme';
import { User } from './lib/realmSchema';

type ThemeContextType = {
  theme: Theme;
  isDark: boolean;
  toggleTheme: () => void;
};

const ThemeContext = createContext<ThemeContextType | undefined>(undefined);

export const ThemeProviderCustom = ({ children }: { children: ReactNode }) => {
  // 設定データを取得
  const users = useQuery(User);

  const [isDark, setIsDark] = useState(users.isEmpty() ? false : users[0].theme === 'dark');

  const toggleTheme = () => {
    setIsDark(prev => !prev);
  };

  const theme = isDark ? DarkTheme : LightTheme;

  return (
    <ThemeContext.Provider value={{ theme, isDark, toggleTheme }}>{children}</ThemeContext.Provider>
  );
};

export const useThemeContext = () => {
  const context = useContext(ThemeContext);
  if (!context) throw new Error('useThemeContext must be used within ThemeProviderCustom');
  return context;
};
