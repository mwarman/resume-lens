import { ThemeToggle } from '@/components/theme/ThemeToggle';

/**
 * Header component displays the application title and theme toggle.
 * Rendered with Tailwind utility classes for consistent light/dark mode support.
 * ThemeToggle is placed top-right as the conventional location for theme controls.
 */
const Header = () => {
  return (
    <header className="px-6 py-3 border-b border-border">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-foreground">Resume Lens</h1>
          <p className="text-sm text-muted-foreground">AI-powered resume data extraction</p>
        </div>
        <ThemeToggle />
      </div>
    </header>
  );
};

export default Header;
