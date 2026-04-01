'use client';

import React, { createContext, useContext, useEffect, useState } from 'react';

export type BackgroundTheme = 'default' | 'white' | 'black' | 'navy' | 'slate';
export type PrimaryTheme = 'blue' | 'emerald' | 'violet' | 'amber' | 'rose';
export type TextTheme = 'standard' | 'soft' | 'vivid';

interface ThemeConfig {
  bg: BackgroundTheme;
  primary: PrimaryTheme;
  text: TextTheme;
}

interface ThemeContextType {
  theme: ThemeConfig;
  setBg: (bg: BackgroundTheme) => void;
  setPrimary: (p: PrimaryTheme) => void;
  setText: (t: TextTheme) => void;
}

const ThemeContext = createContext<ThemeContextType | undefined>(undefined);

export function ThemeProvider({ children }: { children: React.ReactNode }) {
  const [theme, setThemeState] = useState<ThemeConfig>({
    bg: 'default',
    primary: 'blue',
    text: 'standard'
  });

  useEffect(() => {
    const saved = localStorage.getItem('app-modular-theme');
    if (saved) {
      const parsed = JSON.parse(saved) as ThemeConfig;
      setThemeState(parsed);
      applyTheme(parsed);
    }
  }, []);

  const applyTheme = (config: ThemeConfig) => {
    document.body.setAttribute('data-bg', config.bg);
    document.body.setAttribute('data-primary', config.primary);
    document.body.setAttribute('data-text', config.text);
  };

  const setBg = (bg: BackgroundTheme) => {
    const newTheme = { ...theme, bg };
    setThemeState(newTheme);
    localStorage.setItem('app-modular-theme', JSON.stringify(newTheme));
    applyTheme(newTheme);
  };

  const setPrimary = (primary: PrimaryTheme) => {
    const newTheme = { ...theme, primary };
    setThemeState(newTheme);
    localStorage.setItem('app-modular-theme', JSON.stringify(newTheme));
    applyTheme(newTheme);
  };

  const setText = (text: TextTheme) => {
    const newTheme = { ...theme, text };
    setThemeState(newTheme);
    localStorage.setItem('app-modular-theme', JSON.stringify(newTheme));
    applyTheme(newTheme);
  };

  return (
    <ThemeContext.Provider value={{ theme, setBg, setPrimary, setText }}>
      {children}
    </ThemeContext.Provider>
  );
}

export function useAppTheme() {
  const context = useContext(ThemeContext);
  if (context === undefined) {
    throw new Error('useAppTheme must be used within a ThemeProvider');
  }
  return context;
}