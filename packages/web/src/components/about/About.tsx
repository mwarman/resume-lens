import { JSX } from 'react';
import { Info } from 'lucide-react';

import { Button } from '@/components/shadcn/button';
import {
  Sheet,
  SheetClose,
  SheetContent,
  SheetDescription,
  SheetFooter,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from '@/components/shadcn/sheet';

const About = (): JSX.Element => {
  return (
    <Sheet>
      <SheetTrigger asChild>
        <Button variant="ghost" size="icon">
          <Info className="h-[1.2rem] w-[1.2rem]" />
          <span className="sr-only">About this project</span>
        </Button>
      </SheetTrigger>
      <SheetContent>
        <SheetHeader>
          <SheetTitle>About Resume Lens</SheetTitle>
          <SheetDescription>An AI-powered portfolio project</SheetDescription>
        </SheetHeader>
        <div className="flex gap-4 flex-col px-4">
          <div>
            This portfolio project demonstrates the capabilities of Resume Lens, an AI-powered resume data extraction
            and structured output tool. It allows users to upload their resumes and see how the AI extracts structured
            information such as professional summary, contact details, work experience, education, and skills. The
            project showcases the use of Amazon Bedrock for AI processing, inference, and producing structured JSON
            output. It serves as a practical example of how AI can be integrated into real-world applications to solve
            common problems with AI inference and data extraction from source data while observing best practices for
            prompt engineering and token management.
          </div>
          <div>
            The project is available on GitHub, where you can find the source code and documentation. It includes
            instructions for getting started, system documentation, and examples of how to use the tool.
          </div>
          <div>
            For more information, visit the{' '}
            <a
              href="https://github.com/mwarman/resume-lens"
              target="_blank"
              rel="noopener noreferrer"
              className="text-blue-500 underline"
            >
              GitHub repository
            </a>
            .
          </div>
        </div>
        <SheetFooter>
          <SheetClose asChild>
            <Button variant="outline">Close</Button>
          </SheetClose>
        </SheetFooter>
      </SheetContent>
    </Sheet>
  );
};

export default About;
