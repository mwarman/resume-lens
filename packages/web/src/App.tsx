import type { ResumeExtraction } from '@resume-lens/shared';
import { ResumeLensErrorCode } from '@resume-lens/shared';

// Verify shared imports resolve correctly at compile time
type _ExtractionCheck = ResumeExtraction;
const _errorCodeCheck = ResumeLensErrorCode;
void _errorCodeCheck;

const App = () => {
  return (
    <div>
      <h1>Resume Lens</h1>
    </div>
  );
};

export default App;
