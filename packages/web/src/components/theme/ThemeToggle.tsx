import { Moon, Sun } from 'lucide-react';

import { Button } from '@/components/shadcn/button';
import { useTheme } from '@/contexts/ThemeContext';

/**
 * ThemeToggle component provides a button to toggle between light and dark themes.
 * The icon indicates which theme it will switch to (sun for dark, moon for light).
 */
export const ThemeToggle = () => {
  const { theme, setTheme } = useTheme();

  const handleToggle = () => {
    setTheme(theme === 'light' ? 'dark' : 'light');
  };

  return (
    <Button variant="ghost" size="icon" onClick={handleToggle}>
      {theme === 'light' ? <Moon className="h-[1.2rem] w-[1.2rem]" /> : <Sun className="h-[1.2rem] w-[1.2rem]" />}
      <span className="sr-only">Toggle theme</span>
    </Button>
  );
};
