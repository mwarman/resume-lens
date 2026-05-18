import { Skeleton } from '@/components/shadcn/skeleton';

/**
 * LoadingState renders a skeleton loader that mirrors the ResultCard layout.
 * Features:
 * - Two-column layout (left: structured sections, right: JSON placeholder)
 * - Responsive: 1 column on smaller screens
 * - "Analyzing…" overlay message
 * - Matches light/dark theme from ThemeContext
 * - Uses shadcn Skeleton component with Tailwind styling
 */
const LoadingState = () => {
  return (
    <div className="relative p-8 bg-background min-h-125 flex flex-col">
      {/* Overlay message - centered on top of skeleton */}
      <div className="absolute inset-0 flex items-center justify-center pointer-events-none z-10">
        <div className="text-4xl font-bold text-primary">Analyzing…</div>
      </div>

      {/* Two-column layout mirroring ResultCard */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 opacity-50 dark:opacity-30 flex-1">
        {/* Left column: Structured skeleton content */}
        <div className="min-w-0 space-y-6">
          {/* Header skeleton */}
          <div className="border-b-2 border-border pb-6">
            <Skeleton className="h-6 w-3/5 mb-3" />
            <Skeleton className="h-3 w-full mb-2" />
            <Skeleton className="h-3 w-1/2" />
          </div>

          {/* Summary skeleton */}
          <div className="space-y-2">
            <Skeleton className="h-5 w-2/3" />
            <Skeleton className="h-3 w-full" />
            <Skeleton className="h-3 w-11/12" />
            <Skeleton className="h-3 w-10/12" />
          </div>

          {/* AI Inferences / Seniority Badge section */}
          <div className="space-y-2 pl-3 border-l-4 border-purple-400">
            <Skeleton className="h-5 w-2/3" />
            <Skeleton className="h-8 w-28" />
          </div>

          {/* Tech Skills section */}
          <div className="space-y-2">
            <Skeleton className="h-5 w-2/3" />
            <div className="flex flex-wrap gap-2">
              <Skeleton className="h-8 w-20" />
              <Skeleton className="h-8 w-24" />
              <Skeleton className="h-8 w-16" />
              <Skeleton className="h-8 w-28" />
            </div>
          </div>

          {/* Soft Skills section */}
          <div className="space-y-2">
            <Skeleton className="h-5 w-2/3" />
            <div className="flex flex-wrap gap-2">
              <Skeleton className="h-8 w-24" />
              <Skeleton className="h-8 w-20" />
              <Skeleton className="h-8 w-28" />
            </div>
          </div>

          {/* Experience section */}
          <div className="space-y-3">
            <Skeleton className="h-5 w-2/3" />
            <div className="space-y-2">
              <Skeleton className="h-4 w-1/2" />
              <Skeleton className="h-3 w-1/3" />
              <Skeleton className="h-3 w-full" />
              <Skeleton className="h-3 w-11/12" />
            </div>
          </div>

          {/* Education section */}
          <div className="space-y-2">
            <Skeleton className="h-5 w-2/3" />
            <Skeleton className="h-4 w-3/4" />
            <Skeleton className="h-3 w-1/2" />
          </div>

          {/* Certifications section */}
          <div className="space-y-2">
            <Skeleton className="h-5 w-2/3" />
            <Skeleton className="h-4 w-2/3" />
            <Skeleton className="h-4 w-1/2" />
          </div>
        </div>

        {/* Right column: Large skeleton block for JSON */}
        <div className="min-w-0 flex flex-col">
          <Skeleton className="flex-1 min-h-80 rounded-lg" />
        </div>
      </div>
    </div>
  );
};

export default LoadingState;
