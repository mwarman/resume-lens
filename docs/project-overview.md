# resume-lens — Project Overview

**Type:** Portfolio project — AI integration demonstration  
**Status:** In build phase  
**Last updated:** April 2026

---

## **Purpose**

`resume-lens` is a portfolio piece designed to demonstrate production-quality AI integration skills to technical hiring managers. It is intentionally scoped to showcase architectural judgment and clean integration patterns rather than AI depth or model customization.

The core feature: upload a PDF résumé, receive a structured, typed JSON extraction of the candidate's profile — including one AI-inferred field (`inferredSeniorityLevel`) that demonstrates the distinction between parsing and intelligence.

---

## **Tech Stack**

| Layer            | Technology                        | Notes                                      |
| :--------------- | :-------------------------------- | :----------------------------------------- |
| Frontend         | React \+ Vite                     | Vanilla React SPA, no routing library      |
| Frontend hosting | S3 \+ CloudFront                  | AWS-native static hosting                  |
| API layer        | Plain TypeScript Lambda functions | AWS-native, pay-as-you-use pricing         |
| Compute          | AWS Lambda                        | 512MB memory, synchronous request/response |
| API Gateway      | AWS API Gateway                   | Two routes: `POST /extract`                |
| PDF parsing      | `pdf-parse` (npm)                 | In-process, no external service            |
| AI provider      | AWS Bedrock — Claude 3 Haiku      | On-demand pricing, no provisioned capacity |
| Infrastructure   | AWS CDK (TypeScript)              | Single stack, all resources co-located     |
| Language         | TypeScript throughout             | Shared types across all packages           |

---

## **Monorepo Structure**

```
resume-lens/
├── packages/
│ ├── shared/              # TypeScript types, error codes — no runtime deps
│ ├── api/                 # TypeScript Lambda functions
│ └── web/                 # React + Vite SPA
├── infra/                 # AWS CDK stack
├── package.json           # npm workspaces root
├── tsconfig.base.json     # Shared TS compiler config
└── README.md
```

### `packages/shared`

Single responsibility: the shared contract between frontend and backend. No runtime dependencies.

```
shared/src/
├── types/resume.ts        # ResumeExtraction interface (canonical output type)
└── errors/error-codes.ts  # Typed error code enum
```

### `packages/api`

Plain TypeScript Lambda function. Three services encapsulate specific functionality with orchestration in a strict one-way dependency chain: Intake → Parser → Extraction.

```
api/src/
├── handlers/
│ ├── extract-handler.ts           # Extraction Lambda handler entry point
└── services/
      ├── intake-service.ts        # File type + size validation
      ├── parser-service.ts        # pdf-parse → raw text string
      └── extraction-service.ts    # Prompt construction + Bedrock invocation
```

### `packages/web`

Minimal React SPA.

```
web/src/
├── main.tsx
├── App.tsx
├── components/
│ ├── UploadForm.tsx        # Drag-drop + file picker, PDF only, 5MB cap
│ ├── LoadingState.tsx      # Skeleton / spinner during extraction
│ └── ResultCard.tsx        # Renders ResumeExtraction JSON visually
└── api/
    └── api-client.ts       # Single fetch call, typed against @resume-lens/shared
```

### `infra/`

AWS CDK provisions all resources. For simplicity in this project, use a single stack.

```
infra/
├──app.ts                                # CDK app entry point
└── stacks/resume-lens-stack.ts          # Lambda + API Gateway + S3 + CloudFront + IAM
```

---

## **Data Flow**

```
Browser

→ CloudFront (HTTPS)

→ API Gateway POST /extract (multipart/form-data)

→ Lambda

      → Intake service   (validate file type \+ size)

      → Parser service   (pdf-parse → raw text)

      → Extraction service (prompt \+ Bedrock call)

→ AWS Bedrock (Claude 3 Haiku)

← typed JSON (ResumeExtraction)

← API Gateway

← Browser renders ResultCard
```

All processing is synchronous. No persistence layer. Documents are held in memory for the duration of a single Lambda invocation only.

---

## **Output Type**

The canonical extraction output is defined in the shared package.

```ts
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
    startDate: string | null; // ISO 8601 where inferrable, else raw string
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
    processedAt: string; // ISO 8601
    sourceFormat: 'pdf';
    confidence: {
      experience: 'high' | 'medium' | 'low';
      education: 'high' | 'medium' | 'low';
      skills: 'high' | 'medium' | 'low';
    };
  };
}
```

`inferredSeniorityLevel` is computed by the model, not extracted literally. It is the primary demonstration of AI inference vs. text parsing.

`extractionMeta.confidence` provides per-section confidence signals, allowing the frontend to flag uncertain extractions without surfacing model internals.

---

## **Error Handling Surface**

All error codes are typed in `@resume-lens/shared`. Handled error conditions:

| Condition                 | HTTP Status | Notes                                  |
| :------------------------ | :---------- | :------------------------------------- |
| Unsupported file type     | 415         | PDF only                               |
| File exceeds size limit   | 413         | 5MB cap                                |
| Unparseable / corrupt PDF | 422         | Scanned image-only PDFs, corrupt files |
| Bedrock throttling        | 503         | Retry-after header included            |
| Bedrock service error     | 502         | Generic upstream failure               |
| Extraction parse failure  | 422         | Model returned non-conformant JSON     |

---

## **Cost Profile (demo-scale)**

| Resource                                       | Estimated monthly cost |
| :--------------------------------------------- | :--------------------- |
| Lambda (100 invocations, 512MB, \~5s each)     | \~$0.01                |
| API Gateway (100 requests)                     | \~$0.00                |
| Bedrock — Claude 3 Haiku (\~2K tokens/resume)  | \~$0.05                |
| S3 \+ CloudFront (static hosting, low traffic) | \~$0.02                |
| **Total**                                      | **\< $0.10/month**     |

---

## **Build Order**

Recommended implementation sequence:

1. `packages/shared` — types and error codes first; everything else depends on them
2. `packages/api` — build and test locally with a mock Lambda handler before deploying
3. `infra/` — CDK stack; deploy Lambda \+ API Gateway first, validate end-to-end
4. `packages/web` — build against the deployed API; deploy to S3/CloudFront last
