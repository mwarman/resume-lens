/**
 * @module @resume-lens/shared/types/resume
 *
 * This module defines the TypeScript interface for the structured data extracted from resumes,
 * as well as a Zod schema for runtime validation. The main interface, ResumeExtraction, includes
 * candidate information, summary, inferred seniority level, skills, experience, education,
 * certifications, and metadata about the extraction process.
 */

import z from 'zod';

/**
 * ResumeSchema defines the structure of the candidate information extracted from a resume, including
 * personal details, summary, skills, experience, education, and certifications. This schema is used for
 * validating the extracted data and ensuring it conforms to the expected format.
 */
export const ResumeSchema = z.object({
  candidate: z.object({
    fullName: z.string(),
    email: z.nullable(z.string()),
    phone: z.nullable(z.string()),
    location: z.nullable(z.string()),
    linkedIn: z.nullable(z.string()),
  }),
  summary: z.nullable(z.string()),
  inferredSeniorityLevel: z.enum(['junior', 'mid', 'senior', 'principal', 'unknown']),
  skills: z.object({
    technical: z.array(z.string()),
    soft: z.array(z.string()),
  }),
  experience: z.array(
    z.object({
      company: z.string(),
      title: z.string(),
      startDate: z.nullable(z.string()),
      endDate: z.nullable(z.string()),
      current: z.boolean(),
      highlights: z.array(z.string()),
    }),
  ),
  education: z.array(
    z.object({
      institution: z.string(),
      degree: z.nullable(z.string()),
      field: z.nullable(z.string()),
      graduationYear: z.nullable(z.number()),
    }),
  ),
  certifications: z.array(
    z.object({
      name: z.string(),
      issuer: z.nullable(z.string()),
      year: z.nullable(z.number()),
    }),
  ),
});

/**
 * Resume is the main interface representing the structured data extracted from a resume, including candidate information,
 * summary, inferred seniority level, skills, experience, education, and certifications. This type is used throughout the
 * application to ensure consistent handling of resume data and to provide strong typing for all operations involving
 * extracted resume information.
 */
export type Resume = z.infer<typeof ResumeSchema>;

/**
 * ResumeJsonSchema is a JSON Schema representation of the Resume structure, used for validating that the JSON output from
 * the extraction process conforms to the expected format.
 * Tuned to work with AWS Bedrock's JSON schema validation capabilities, which have some limitations compared to full
 * JSON Schema implementations. For example, we avoid using "const" for fixed string values and instead use "enum" with
 * a single value, since Bedrock's validator does not support "const". We also ensure that all required fields are
 * explicitly listed in the "required" array, as Bedrock requires this for validation. Additionally, we use
 * "additionalProperties: false" to enforce strict schema validation and prevent unexpected fields from being accepted.
 */
export const ResumeJsonSchema = {
  $schema: 'https://json-schema.org/draft/2020-12/schema',
  type: 'object',
  properties: {
    candidate: {
      type: 'object',
      properties: {
        fullName: {
          type: 'string',
          description: 'Full name of the candidate',
        },
        email: {
          type: ['string', 'null'],
          description: 'Email address of the candidate, or null if not present',
        },
        phone: {
          type: ['string', 'null'],
          description: 'Phone number of the candidate, or null if not present',
        },
        location: {
          type: ['string', 'null'],
          description: 'Location of the candidate, or null if not present',
        },
        linkedIn: {
          type: ['string', 'null'],
          description: 'LinkedIn profile URL of the candidate, or null if not present',
        },
      },
      required: ['fullName', 'email', 'phone', 'location', 'linkedIn'],
      additionalProperties: false,
    },
    summary: {
      type: ['string', 'null'],
      description: 'A brief summary of the candidate’s profile, attempt to infer if not present; otherwise null',
    },
    inferredSeniorityLevel: {
      type: 'string',
      enum: ['junior', 'mid', 'senior', 'principal', 'unknown'],
      description:
        'Inferred seniority level based on experience and roles. One of "junior", "mid", "senior", "principal", or "unknown" if it cannot be inferred.',
    },
    skills: {
      type: 'object',
      properties: {
        technical: {
          type: 'array',
          items: {
            type: 'string',
            description: 'A technical skill of the candidate',
          },
        },
        soft: {
          type: 'array',
          items: {
            type: 'string',
            description: 'A soft skill of the candidate',
          },
        },
      },
      required: ['technical', 'soft'],
      additionalProperties: false,
    },
    experience: {
      type: 'array',
      items: {
        type: 'object',
        properties: {
          company: {
            type: 'string',
            description: 'Name of the company for this experience entry',
          },
          title: {
            type: 'string',
            description: 'Job title for this experience entry',
          },
          startDate: {
            type: ['string', 'null'],
            description: 'Start date of the experience, or null if not present',
          },
          endDate: {
            type: ['string', 'null'],
            description: 'End date of the experience, or null if not present',
          },
          current: {
            type: 'boolean',
            description: 'Whether the candidate is currently in this role',
          },
          highlights: {
            type: 'array',
            items: {
              type: 'string',
              description: 'A highlight or achievement for this experience entry',
            },
          },
        },
        required: ['company', 'title', 'startDate', 'endDate', 'current', 'highlights'],
        additionalProperties: false,
      },
    },
    education: {
      type: 'array',
      items: {
        type: 'object',
        properties: {
          institution: {
            type: 'string',
            description: 'Name of the educational institution',
          },
          degree: {
            type: ['string', 'null'],
            description: 'Degree obtained, or null if not present',
          },
          field: {
            type: ['string', 'null'],
            description: 'Field of study, or null if not present',
          },
          graduationYear: {
            type: ['integer', 'null'],
            description: 'Graduation year, or null if not present',
          },
        },
        required: ['institution', 'degree', 'field', 'graduationYear'],
        additionalProperties: false,
      },
    },
    certifications: {
      type: 'array',
      items: {
        type: 'object',
        properties: {
          name: {
            type: 'string',
            description: 'Name of the certification',
          },
          issuer: {
            type: ['string', 'null'],
            description: 'Issuer of the certification, or null if not present',
          },
          year: {
            type: ['integer', 'null'],
            description: 'Year the certification was obtained, or null if not present',
          },
        },
        required: ['name', 'issuer', 'year'],
        additionalProperties: false,
      },
    },
  },
  required: ['candidate', 'summary', 'inferredSeniorityLevel', 'skills', 'experience', 'education', 'certifications'],
  additionalProperties: false,
};

/**
 * ResumeExtraction extends the base Resume schema with additional metadata about the extraction process,
 * such as the model used, processing timestamp, source format, and confidence levels for different sections.
 */
export const ResumeExtractionSchema = ResumeSchema.extend({
  extractionMeta: z.object({
    modelId: z.string(),
    processedAt: z.string(),
    sourceFormat: z.enum(['pdf']),
    confidence: z.object({
      experience: z.enum(['high', 'medium', 'low']),
      education: z.enum(['high', 'medium', 'low']),
      skills: z.enum(['high', 'medium', 'low']),
    }),
  }),
});

/**
 * ResumeExtraction is the main interface representing the structured data extracted from a resume, including both the
 * candidate's information and metadata about the extraction process. This type is used throughout the application
 * to ensure consistent handling of resume data and to provide strong typing for all operations involving extracted
 * resume information.
 */
export type ResumeExtraction = z.infer<typeof ResumeExtractionSchema>;
