import { JSX } from 'react';

import ResumePage from './pages/ResumePage';
import { ThemeProvider } from '@/contexts/ThemeContext';
import { TooltipProvider } from '@/components/shadcn/tooltip';

import '@/index.css';

/**
 * App is the root component of the application.
 * It wraps the application with necessary context providers.
 * @returns JSX.Element
 */
const App = (): JSX.Element => {
  return (
    <ThemeProvider defaultTheme="dark" storageKey="resume-lens-ui-theme">
      <TooltipProvider>
        <ResumePage />
      </TooltipProvider>
    </ThemeProvider>
  );
};

export default App;
