'use client';

import React, { createContext, useContext, useEffect, useState } from 'react';

export type BackgroundTheme = 'default' | 'white' | 'black' | 'navy' | 'slate';
export type PrimaryTheme = 'blue' | 'emerald' | 'violet' | 'amber' | 'rose';
export type TextTheme = 'standard' | 'soft' | 'vivid';
export type NavStyle = 'wheel' | 'straight';

interface ThemeConfig {
  bg: BackgroundTheme;
  primary: PrimaryTheme;
  text: TextTheme;
  navStyle: NavStyle;
}

interface ThemeContextType {
  theme: ThemeConfig;
  setBg: (bg: BackgroundTheme) => void;
  setPrimary: (p: PrimaryTheme) => void;
  setText: (t: TextTheme) => void;
  setNavStyle: (s: NavStyle) => void;
}

const ThemeContext = createContext<ThemeContextType | undefined>(undefined);

export function ThemeProvider({ children }: { children: React.ReactNode }) {
  const [theme, setThemeState] = useState<ThemeConfig>({
    bg: 'default',
    primary: 'blue',
    text: 'standard',
    navStyle: 'wheel'
  });

  useEffect(() => {
    const saved = localStorage.getItem('app-modular-theme');
    if (saved) {
      try {
        const parsed = JSON.parse(saved) as ThemeConfig;
        if (!parsed.navStyle) parsed.navStyle = 'wheel';
        setThemeState(parsed);
        // Attributes are already set by the blocking script in head, 
        // but we ensure consistency here.
        applyTheme(parsed);
      } catch (e) {
        console.error("Theme restoration failed", e);
      }
    }
  }, []);

  const applyTheme = (config: ThemeConfig) => {
    if (typeof document !== 'undefined') {
      document.body.setAttribute('data-bg', config.bg);
      document.body.setAttribute('data-primary', config.primary);
      document.body.setAttribute('data-text', config.text);
    }
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

  const setNavStyle = (navStyle: NavStyle) => {
    const newTheme = { ...theme, navStyle };
    setThemeState(newTheme);
    localStorage.setItem('app-modular-theme', JSON.stringify(newTheme));
  };

  return (
    <ThemeContext.Provider value={{ theme, setBg, setPrimary, setText, setNavStyle }}>
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
