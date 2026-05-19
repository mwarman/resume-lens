import { JSX } from 'react';

import ResumePage from './pages/ResumePage';
import { ThemeProvider } from '@/contexts/ThemeContext';
import { TooltipProvider } from '@/components/shadcn/tooltip';

import '@/index.css';

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
