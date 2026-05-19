import { ThemeToggle } from '@/components/theme/ThemeToggle';
import About from '@/components/about/About';

/**
 * Header component displays the application title and theme toggle.
 * Rendered with Tailwind utility classes for consistent light/dark mode support.
 * ThemeToggle is placed top-right as the conventional location for theme controls.
 */
const Header = () => {
  return (
    <header className="px-6 py-3 h-20 w-full border-b border-border sticky top-0 bg-background z-50">
      <div className="flex items-center justify-between">
        {/** Left side content */}
        <div>
          <h1 className="text-2xl font-bold text-foreground">Resume Lens</h1>
          <p className="text-sm text-muted-foreground">AI-powered resume data extraction</p>
        </div>
        {/** Right side content */}
        <div className="space-x-4">
          <About />
          <ThemeToggle />
        </div>
      </div>
    </header>
  );
};

export default Header;
