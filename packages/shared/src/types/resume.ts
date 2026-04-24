/**
 * ResumeExtraction — Canonical extraction output type.
 *
 * This is the primary contract between the API and the frontend.
 * All fields that are logically optional are typed as `T | null` (not optional `?`).
 * This schema reflects real-world résumé incompleteness and is explicit about absence.
 */

export interface ResumeExtraction {
  candidate: {
    fullName: string;
    email: string | null;
    phone: string | null;
    location: string | null;
    linkedIn: string | null;
  };

  summary: string | null;

  inferredSeniorityLevel: 'junior' | 'mid' | 'senior' | 'principal' | 'unknown';

  skills: {
    technical: string[];
    soft: string[];
  };

  experience: Array<{
    company: string;
    title: string;
    startDate: string | null;
    endDate: string | null;
    current: boolean;
    highlights: string[];
  }>;

  education: Array<{
    institution: string;
    degree: string | null;
    field: string | null;
    graduationYear: number | null;
  }>;

  certifications: Array<{
    name: string;
    issuer: string | null;
    year: number | null;
  }>;

  extractionMeta: {
    modelId: string;
    processedAt: string;
    sourceFormat: 'pdf';
    confidence: {
      experience: 'high' | 'medium' | 'low';
      education: 'high' | 'medium' | 'low';
      skills: 'high' | 'medium' | 'low';
    };
  };
}
