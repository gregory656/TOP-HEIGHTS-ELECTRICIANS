import { useCallback, useEffect, useMemo, useState, type ReactNode } from 'react';
import { applyTheme, initialMode, THEME_STORAGE_KEY, ThemeContext, type ThemeMode } from './ThemeContextData';

export function AppThemeProvider({ children }: { children: ReactNode }) {
  const [mode, setMode] = useState<ThemeMode>(initialMode);
  const [systemMode, setSystemMode] = useState<'light' | 'dark'>('light');
  const resolvedMode = mode === 'system' ? systemMode : 'light';
  useEffect(() => { applyTheme(resolvedMode); }, [resolvedMode]);
  useEffect(() => { try { localStorage.setItem(THEME_STORAGE_KEY, JSON.stringify({ mode })); } catch { /* Storage may be unavailable. */ } }, [mode]);
  useEffect(() => {
    const query = window.matchMedia('(prefers-color-scheme: dark)');
    const change = (event: MediaQueryListEvent) => { if (mode === 'system') setSystemMode(event.matches ? 'dark' : 'light'); };
    query.addEventListener('change', change);
    return () => query.removeEventListener('change', change);
  }, [mode]);
  const toggleTheme = useCallback(() => setMode(previous => previous === 'dark' ? 'light' : 'dark'), []);
  const setThemeMode = useCallback((next: ThemeMode) => { setMode(next); setSystemMode('light'); }, []);
  const value = useMemo(() => ({ mode, resolvedMode, toggleTheme, setThemeMode }), [mode, resolvedMode, toggleTheme, setThemeMode]);
  return <ThemeContext.Provider value={value}>{children}</ThemeContext.Provider>;
}
