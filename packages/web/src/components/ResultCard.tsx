import { JSX, useState } from 'react';
import { ChevronDown, ChevronRight, ClipboardCopy, Info } from 'lucide-react';
import { toast } from 'sonner';

import type { ResumeExtraction } from '@resume-lens/shared';
import { Badge } from '@/components/shadcn/badge';
import { Button } from '@/components/shadcn/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/shadcn/card';
import { Tooltip, TooltipTrigger, TooltipContent } from '@/components/shadcn/tooltip';
import { ResizableHandle, ResizablePanel, ResizablePanelGroup } from '@/components/shadcn/resizable';
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from '@/components/shadcn/collapsible';
import SyntaxHighlighter from '@/components/syntax/SyntaxHighlighter';

interface ResultCardProps {
  extraction: ResumeExtraction;
  onReset: () => void;
}

/**
 * Renders a confidence badge with appropriate styling based on confidence level.
 * High confidence is quiet (no badge), medium and low are visible.
 */
const ConfidenceBadge = ({ level }: { level: 'high' | 'medium' | 'low' }) => {
  if (level === 'high') return null;

  const variant = level === 'low' ? 'destructive' : 'secondary';
  const label = level.charAt(0).toUpperCase() + level.slice(1);

  return <Badge variant={variant}>{label}</Badge>;
};

/**
 * Maps seniority levels to color variants for the Badge component.
 * junior: blue, mid: teal, senior: purple, principal: orange, unknown: gray
 */
const getSeniorityBadgeVariant = (level: string): 'default' | 'secondary' | 'destructive' | 'outline' => {
  switch (level) {
    case 'junior':
      return 'secondary'; // blue
    case 'mid':
      return 'outline'; // teal
    case 'senior':
      return 'default'; // purple
    case 'principal':
      return 'destructive'; // orange
    default:
      return 'outline'; // gray
  }
};

const copyExtractionToClipboard = (extraction: ResumeExtraction) => {
  const jsonStr = JSON.stringify(extraction, null, 2);
  navigator.clipboard.writeText(jsonStr);
  toast.success('Resume JSON copied to clipboard');
};

/**
 * ResultCard renders the full ResumeExtraction result in a structured, scannable layout.
 * Features:
 * - Tailwind CSS with dark mode support (dark: variants)
 * - shadcn components throughout (Badge, Card, Button, Tooltip)
 * - Candidate block with labeled contact info
 * - AI-inferred seniority level with tooltip explaining it is model-computed
 * - Confidence indicators per section (low/medium visible, high omitted)
 * - Skills as badges (technical and soft grouped with separators)
 * - Experience and education in cards
 * - Certifications section
 * - Collapsible metadata section
 * - "Analyze another résumé" button at bottom
 */
const ResultCard = ({ extraction, onReset }: ResultCardProps): JSX.Element => {
  const [isMetadataOpen, setIsMetadataOpen] = useState(true);

  const formatDate = (dateStr: string | null) => {
    if (!dateStr) return 'N/A';
    return dateStr;
  };

  const dateRange = (start: string | null, end: string | null, current: boolean) => {
    if (current) return `${formatDate(start)} — Present`;
    return `${formatDate(start)} — ${formatDate(end)}`;
  };

  return (
    <div className="max-w-7xl mx-auto px-4 py-8 md:px-6 md:py-12">
      {/* Two-column layout: structured data (left) and raw JSON (right) */}
      <ResizablePanelGroup orientation="horizontal" className="gap-8 mb-8">
        {/* Left column: Structured content (2 cols on large screens) */}
        <ResizablePanel defaultSize="50%" className="space-y-6 px-0.5">
          {/* Candidate Header Block */}
          <div className="border-b border-gray-200 dark:border-slate-700 pb-6">
            <h2 className="text-3xl md:text-4xl font-bold text-gray-900 dark:text-white mb-4">
              {extraction.candidate.fullName}
            </h2>
            <div className="flex flex-wrap gap-x-4 gap-y-1 text-sm">
              {extraction.candidate.email && (
                <div className="flex items-center gap-2">
                  <span className="font-medium text-gray-700 dark:text-gray-300">Email:</span>
                  <a
                    href={`mailto:${extraction.candidate.email}`}
                    className="text-blue-600 dark:text-blue-400 hover:underline"
                  >
                    {extraction.candidate.email}
                  </a>
                </div>
              )}
              {extraction.candidate.phone && (
                <div className="flex items-center gap-2">
                  <span className="font-medium text-gray-700 dark:text-gray-300">Phone:</span>
                  <span className="text-gray-600 dark:text-gray-400">{extraction.candidate.phone}</span>
                </div>
              )}
              {extraction.candidate.location && (
                <div className="flex items-center gap-2">
                  <span className="font-medium text-gray-700 dark:text-gray-300">Location:</span>
                  <span className="text-gray-600 dark:text-gray-400">{extraction.candidate.location}</span>
                </div>
              )}
              {extraction.candidate.linkedIn && (
                <div className="flex items-center gap-2">
                  <span className="font-medium text-gray-700 dark:text-gray-300">LinkedIn:</span>
                  <a
                    href={extraction.candidate.linkedIn}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-blue-600 dark:text-blue-400 hover:underline"
                  >
                    Profile
                  </a>
                </div>
              )}
            </div>
          </div>

          {/* Summary */}
          {extraction.summary && (
            <section className="space-y-3">
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white">Summary</h3>
              <p className="text-gray-700 dark:text-gray-300 leading-relaxed">{extraction.summary}</p>
            </section>
          )}

          {/* AI-Inferred Seniority Level */}
          <section className="space-y-3">
            <div className="flex items-center gap-2">
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white">Seniority (AI-Inferred)</h3>
              <Tooltip>
                <TooltipTrigger asChild>
                  <Info className="h-4 w-4 text-gray-500 dark:text-gray-400 cursor-help" />
                </TooltipTrigger>
                <TooltipContent className="max-w-xs">
                  <p>This level is computed by the AI model based on resume content, not extracted directly.</p>
                </TooltipContent>
              </Tooltip>
            </div>
            <Badge variant={getSeniorityBadgeVariant(extraction.inferredSeniorityLevel)} className="capitalize">
              {extraction.inferredSeniorityLevel}
            </Badge>
          </section>

          {/* Technical Skills */}
          {extraction.skills.technical.length > 0 && (
            <section className="space-y-3">
              <div className="flex items-center justify-between">
                <h3 className="text-lg font-semibold text-gray-900 dark:text-white">Technical Skills</h3>
                <ConfidenceBadge level={extraction.extractionMeta.confidence.skills} />
              </div>
              <div className="flex flex-wrap gap-2">
                {extraction.skills.technical.map((skill) => (
                  <Badge key={skill} variant="secondary">
                    {skill}
                  </Badge>
                ))}
              </div>
            </section>
          )}

          {/* Soft Skills */}
          {extraction.skills.soft.length > 0 && (
            <section className="space-y-3">
              <div className="flex items-center justify-between">
                <h3 className="text-lg font-semibold text-gray-900 dark:text-white">Soft Skills</h3>
                <ConfidenceBadge level={extraction.extractionMeta.confidence.skills} />
              </div>
              <div className="flex flex-wrap gap-2">
                {extraction.skills.soft.map((skill) => (
                  <Badge key={skill} variant="outline">
                    {skill}
                  </Badge>
                ))}
              </div>
            </section>
          )}

          {/* Experience */}
          {extraction.experience.length > 0 && (
            <section className="space-y-4">
              <div className="flex items-center justify-between">
                <h3 className="text-lg font-semibold text-gray-900 dark:text-white">Experience</h3>
                <ConfidenceBadge level={extraction.extractionMeta.confidence.experience} />
              </div>
              <div className="space-y-3">
                {extraction.experience.map((exp, idx) => (
                  <Card key={idx} className="border-l-4 border-l-blue-500 dark:border-l-blue-600 gap-2">
                    <CardHeader>
                      <CardTitle className="flex items-center justify-between">
                        <h4>{exp.title}</h4>
                        {exp.current && (
                          <Badge variant="default" className="whitespace-nowrap">
                            Current
                          </Badge>
                        )}
                      </CardTitle>
                      <CardDescription className="text-gray-700 dark:text-gray-300">
                        {exp.company}
                        {/* <p className="text-sm text-gray-600 dark:text-gray-400">{exp.company}</p> */}
                      </CardDescription>
                    </CardHeader>
                    <CardContent>
                      <p className="text-xs text-gray-500 dark:text-gray-500 mb-3">
                        {dateRange(exp.startDate, exp.endDate, exp.current)}
                      </p>
                      {exp.highlights.length > 0 && (
                        <ul className="space-y-1 ml-4 list-disc text-sm text-gray-700 dark:text-gray-300">
                          {exp.highlights.map((highlight, hIdx) => (
                            <li key={hIdx}>
                              <span>{highlight}</span>
                            </li>
                          ))}
                        </ul>
                      )}
                    </CardContent>
                  </Card>
                ))}
              </div>
            </section>
          )}

          {/* Education */}
          {extraction.education.length > 0 && (
            <section className="space-y-4">
              <div className="flex items-center justify-between">
                <h3 className="text-lg font-semibold text-gray-900 dark:text-white">Education</h3>
                <ConfidenceBadge level={extraction.extractionMeta.confidence.education} />
              </div>
              <div className="space-y-3">
                {extraction.education.map((edu, idx) => (
                  <Card key={idx} className="border-l-4 border-l-green-500 dark:border-l-green-600 gap-2">
                    <CardHeader>
                      <CardTitle>
                        <h4 className="font-semibold text-gray-900 dark:text-white">{edu.institution}</h4>
                      </CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="text-sm text-gray-600 dark:text-gray-400">
                        {edu.degree && <p>{edu.degree}</p>}
                        {edu.field && <p>{edu.field}</p>}
                        {edu.graduationYear && (
                          <p className="text-xs text-gray-500 dark:text-gray-500">{edu.graduationYear}</p>
                        )}
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </section>
          )}

          {/* Certifications */}
          {extraction.certifications.length > 0 && (
            <section className="space-y-4">
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white">Certifications</h3>
              <div className="space-y-3">
                {extraction.certifications.map((cert, idx) => (
                  <Card key={idx} className="border-l-4 border-l-amber-500 dark:border-l-amber-600 gap-2">
                    <CardHeader>
                      <CardTitle>
                        <h4 className="font-semibold text-gray-900 dark:text-white">{cert.name}</h4>
                      </CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="text-sm text-gray-600 dark:text-gray-400">
                        {cert.issuer && <p>{cert.issuer}</p>}
                        {cert.year && <p className="text-xs text-gray-500 dark:text-gray-500">{cert.year}</p>}
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </section>
          )}
        </ResizablePanel>

        <ResizableHandle withHandle />

        {/* Right column: Raw JSON */}
        <ResizablePanel defaultSize="50%" className="px-0.5">
          <Card className="bg-gray-200 dark:bg-gray-700 pb-0">
            <CardHeader>
              <CardTitle className="flex items-center justify-between">
                <h4 className="text-lg font-semibold text-gray-900 dark:text-white">Raw API Response</h4>
                <Button
                  variant="ghost"
                  size="icon"
                  title="Copy JSON to clipboard"
                  onClick={() => copyExtractionToClipboard(extraction)}
                >
                  <ClipboardCopy className="h-4 w-4 text-gray-500 dark:text-gray-400" />
                  <span className="sr-only">Copy JSON to clipboard</span>
                </Button>
              </CardTitle>
            </CardHeader>
            <CardContent className="p-0">
              <SyntaxHighlighter language="json" wrapLongLines>
                {JSON.stringify(extraction, null, 2)}
              </SyntaxHighlighter>
            </CardContent>
          </Card>
        </ResizablePanel>
      </ResizablePanelGroup>

      {/* Metadata Section - Collapsible */}
      <section className="mb-8">
        <Collapsible open={isMetadataOpen} onOpenChange={setIsMetadataOpen}>
          <Card className="py-0">
            <CardHeader className="bg-gray-200 dark:bg-gray-700 py-3 px-0">
              <CardTitle>
                <CollapsibleTrigger asChild>
                  <Button variant="link" className="w-full justify-start">
                    {isMetadataOpen ? <ChevronDown className="h-4 w-4" /> : <ChevronRight className="h-4 w-4" />}
                    <h4 className="text-lg font-semibold text-gray-900 dark:text-white">Extraction Metadata</h4>
                  </Button>
                </CollapsibleTrigger>
              </CardTitle>
            </CardHeader>
            <CollapsibleContent>
              <CardContent>
                <div className="space-y-2 pb-4">
                  <div className="flex justify-between items-center text-sm">
                    <span className="font-medium text-gray-700 dark:text-gray-300">Model:</span>
                    <code className="text-gray-600 dark:text-gray-400 font-mono">
                      {extraction.extractionMeta.modelId}
                    </code>
                  </div>
                  <div className="flex justify-between items-center text-sm">
                    <span className="font-medium text-gray-700 dark:text-gray-300">Processed:</span>
                    <time className="text-gray-600 dark:text-gray-400">
                      {new Date(extraction.extractionMeta.processedAt).toLocaleString()}
                    </time>
                  </div>
                  <div className="flex justify-between items-center text-sm">
                    <span className="font-medium text-gray-700 dark:text-gray-300">Source:</span>
                    <span className="text-gray-600 dark:text-gray-400">
                      {extraction.extractionMeta.sourceFormat.toUpperCase()}
                    </span>
                  </div>
                </div>
              </CardContent>
            </CollapsibleContent>
          </Card>
        </Collapsible>
      </section>

      {/* Action Button */}
      <div className="flex justify-center">
        <Button onClick={onReset} size="lg" className="px-8">
          Analyze Another Resume
        </Button>
      </div>
    </div>
  );
};

export default ResultCard;
