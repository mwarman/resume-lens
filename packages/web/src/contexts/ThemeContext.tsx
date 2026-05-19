import { createContext, useContext, useEffect, useState } from 'react';

type Theme = 'dark' | 'light';

type ThemeProviderProps = {
  children: React.ReactNode;
  storageKey?: string;
};

type ThemeProviderState = {
  theme: Theme;
  setTheme: (theme: Theme) => void;
};

const initialState: ThemeProviderState = {
  theme: 'light',
  setTheme: () => null,
};

const ThemeProviderContext = createContext<ThemeProviderState>(initialState);

/**
 * ThemeProvider component manages the application theme.
 * Supports light and dark themes.
 * Theme preference is persisted to localStorage.
 * If no preference is stored, uses the system OS preference on first load.
 */
export const ThemeProvider = ({ children, storageKey = 'resume-lens-ui-theme', ...props }: ThemeProviderProps) => {
  const [theme, setThemeState] = useState<Theme>(() => {
    const stored = localStorage.getItem(storageKey);
    if (stored === 'light' || stored === 'dark') {
      return stored;
    }
    // Fall back to system preference
    return window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light';
  });

  useEffect(() => {
    const root = window.document.documentElement;

    root.classList.remove('light', 'dark');
    root.classList.add(theme);
  }, [theme]);

  const value = {
    theme,
    setTheme: (newTheme: Theme) => {
      localStorage.setItem(storageKey, newTheme);
      setThemeState(newTheme);
    },
  };

  return (
    <ThemeProviderContext.Provider {...props} value={value}>
      {children}
    </ThemeProviderContext.Provider>
  );
};

/**
 * useTheme hook provides access to the current theme and setTheme function.
 * Must be used within a ThemeProvider.
 */
export const useTheme = () => {
  const context = useContext(ThemeProviderContext);

  if (context === undefined) throw new Error('useTheme must be used within a ThemeProvider');

  return context;
};
