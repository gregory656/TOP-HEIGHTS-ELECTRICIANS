import React, {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
} from 'react';
import type { Theme } from '@mui/material/styles';
import { lightTheme, darkTheme } from '../theme';

const STORAGE_KEY = 'app-theme';

/**
 * Theme mode type
 */
export type ThemeMode = 'light' | 'dark' | 'system';

/**
 * Interface for theme context
 */
interface ThemeContextType {
  mode: ThemeMode;
  resolvedMode: 'light' | 'dark';
  toggleTheme: () => void;
  setThemeMode: (mode: ThemeMode) => void;
}

/**
 * Theme context
 */
const ThemeContext = createContext<ThemeContextType | undefined>(undefined);

/**
 * Get system preference
 */
function getSystemPreference(): 'light' | 'dark' {
  if (typeof window === 'undefined') return 'dark';
  
  return window.matchMedia('(prefers-color-scheme: dark)').matches 
    ? 'dark' 
    : 'light';
}

/**
 * Resolve the actual theme mode (excluding 'system')
 */
function resolveMode(mode: ThemeMode): 'light' | 'dark' {
  if (mode === 'system') {
    return getSystemPreference();
  }
  return mode;
}

/**
 * Apply theme to document
 */
function applyTheme(mode: 'light' | 'dark'): void {
  if (typeof document !== 'undefined') {
    document.documentElement.setAttribute('data-theme', mode);
    document.documentElement.classList.remove('light', 'dark');
    document.documentElement.classList.add(mode);
  }
}

/**
 * App-level theme state provider (NOT the MUI ThemeProvider)
 */
export function AppThemeProvider({ children }: { children: React.ReactNode }) {
  // Get initial mode from localStorage or default to 'system'
  const getInitialMode = (): ThemeMode => {
    if (typeof window === 'undefined') return 'system';
    
    const stored = localStorage.getItem(STORAGE_KEY);
    if (stored) {
      try {
        const parsed = JSON.parse(stored);
        return parsed.mode || 'system';
      } catch {
        return 'system';
      }
    }
    return 'system';
  };

  const [mode, setModeState] = useState<ThemeMode>(getInitialMode);
  const [resolvedMode, setResolvedMode] = useState<'light' | 'dark'>(() => 
    resolveMode(getInitialMode())
  );

  // Update resolved mode when mode changes
  useEffect(() => {
    const newResolvedMode = resolveMode(mode);
    setResolvedMode(newResolvedMode);
    applyTheme(newResolvedMode);
  }, [mode]);

  // Save mode to localStorage
  useEffect(() => {
    localStorage.setItem(STORAGE_KEY, JSON.stringify({ mode }));
  }, [mode]);

  // Toggle theme function
  const toggleTheme = useCallback(() => {
    setModeState((prev) => {
      const newMode = prev === 'dark' ? 'light' : 'dark';
      return newMode;
    });
  }, []);

  // Set theme mode explicitly
  const setThemeMode = useCallback((newMode: ThemeMode) => {
    setModeState(newMode);
  }, []);

  // Set up system preference listener
  useEffect(() => {
    if (typeof window === 'undefined') return;

    const mediaQuery = window.matchMedia('(prefers-color-scheme: dark)');
    
    const handleChange = (e: MediaQueryListEvent | MediaQueryList) => {
      if (mode === 'system') {
        const newMode = e.matches ? 'dark' : 'light';
        setResolvedMode(newMode);
        applyTheme(newMode);
      }
    };
    
    mediaQuery.addEventListener('change', handleChange);
    
    return () => {
      mediaQuery.removeEventListener('change', handleChange);
    };
  }, [mode]);

  const value = useMemo(
    () => ({
      mode,
      resolvedMode,
      toggleTheme,
      setThemeMode,
    }),
    [mode, resolvedMode, toggleTheme, setThemeMode]
  );

  return (
    <ThemeContext.Provider value={value}>
      {children}
    </ThemeContext.Provider>
  );
}

/**
 * Custom hook to use theme context
 */
export function useTheme(): ThemeContextType {
  const context = useContext(ThemeContext);
  if (!context) {
    throw new Error('useTheme must be used within an AppThemeProvider');
  }
  return context;
}

/**
 * Custom hook to get the resolved theme based on current mode
 */
export function useResolvedTheme(): Theme {
  const { resolvedMode } = useTheme();

  // Themes are pre-created; this is just a stable selection.
  return resolvedMode === 'dark' ? darkTheme : lightTheme;
}

/**
 * Initialize theme from storage or system preference
 * This should be called once at app startup (before React mounts)
 */
export function initializeTheme(): 'light' | 'dark' {
  if (typeof window === 'undefined') return 'dark';
  
  const storedMode = localStorage.getItem(STORAGE_KEY);
  let mode: ThemeMode = 'system';
  
  if (storedMode) {
    try {
      const parsed = JSON.parse(storedMode);
      mode = parsed.mode || 'system';
    } catch {
      // If parsing fails, use system
    }
  }
  
  const resolvedMode = resolveMode(mode);
  applyTheme(resolvedMode);
  
  return resolvedMode;
}

/**
 * Set up system preference listener
 * Returns cleanup function
 */
export function setupSystemPreferenceListener(onChange?: (mode: 'light' | 'dark') => void): () => void {
  if (typeof window === 'undefined') return () => {};
  
  const mediaQuery = window.matchMedia('(prefers-color-scheme: dark)');
  
  const handleChange = (e: MediaQueryListEvent | MediaQueryList) => {
    if (onChange) {
      onChange(e.matches ? 'dark' : 'light');
    }
  };
  
  mediaQuery.addEventListener('change', handleChange);
  
  return () => {
    mediaQuery.removeEventListener('change', handleChange);
  };
}
