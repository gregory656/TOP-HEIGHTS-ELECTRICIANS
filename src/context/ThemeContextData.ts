import { createContext, useContext } from 'react';
import { lightTheme, darkTheme } from '../theme';
export type ThemeMode = 'light' | 'dark' | 'system';
export const THEME_STORAGE_KEY = 'app-theme';
export type ThemeContextType = { mode: ThemeMode; resolvedMode: 'light' | 'dark'; toggleTheme: () => void; setThemeMode: (mode: ThemeMode) => void };
export const ThemeContext = createContext<ThemeContextType | undefined>(undefined);
export function useTheme() {
  const context = useContext(ThemeContext);
  if (!context) throw new Error('useTheme must be used within an AppThemeProvider');
  return context;
}
export function useResolvedTheme() { return useTheme().resolvedMode === 'dark' ? darkTheme : lightTheme; }
export function applyTheme(mode: 'light' | 'dark') {
  if (typeof document === 'undefined') return;
  document.documentElement.setAttribute('data-theme', mode);
  document.documentElement.classList.remove('light', 'dark');
  document.documentElement.classList.add(mode);
}
export function initialMode(): ThemeMode {
  try { const mode = JSON.parse(localStorage.getItem(THEME_STORAGE_KEY) || '{}').mode; return mode === 'system' ? 'system' : 'light'; } catch { return 'light'; }
}
export function initializeTheme() { applyTheme('light'); }
