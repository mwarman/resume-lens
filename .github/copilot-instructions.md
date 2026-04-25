---
name: resume-lens
description: AI integration portfolio project — synchronous résumé extraction using AWS Lambda, Bedrock, and TypeScript.
---

# resume-lens — Copilot Instructions

## Overview

**resume-lens** is a portfolio piece demonstrating production-grade AI integration at AWS scale. The system extracts structured, typed JSON from PDF résumés using Claude 3 Haiku on AWS Bedrock.

Architecture: monorepo (npm workspaces) with three core packages (`shared`, `api`, `web`) plus infrastructure as code (`infra/` via AWS CDK).

Tech stack is **TypeScript throughout** — frontend, backend, IaC, and shared types. This consistency is intentional and signals architectural discipline.

---

## Core Architectural Constraints

### AD-002: AWS Bedrock (Claude 3 Haiku)

- **Non-negotiable**: Bedrock via IAM execution roles — no direct Anthropic API.
- **Model**: Claude 3 Haiku only. Cost-driven. Sufficient for structured extraction from clean text.
- **Capture context**: Every response includes `extractionMeta.modelId` for auditability.

### AD-003: No Persistence

- Documents live in Lambda memory only. Single invocation = single request/response cycle.
- No S3, no DynamoDB, no async queues. This simplicity is intentional.

### AD-004: Plain Lambda Handlers

- Three-service pipeline: Intake → Parser → Extraction. No framework (NestJS rejected).
- Handlers are written as plain TypeScript functions. Fast cold start, minimal bundle.

### AD-007: PDF-Only, 5MB Cap

- Enforce file type and size in Intake service. DOCX not supported.
- Parsed via `pdf-parse` (npm) — in-process, no external service.

### AD-008: Synchronous Processing

- Request → extract → respond. No SSE, no streaming. Clean loading skeleton on the frontend is the correct UX.

### AD-009: Extraction Schema

- See `packages/shared/src/types/resume.ts` for the canonical `ResumeExtraction` interface.
- **Key field**: `inferredSeniorityLevel` — AI-inferred, not extracted. Demonstrates intelligence vs. parsing.
- **Confidence signals**: `extractionMeta.confidence` per section (`experience`, `education`, `skills`). Allows frontend to surface uncertainty without exposing model internals.
- All optional fields are explicitly nullable. Schema reflects real-world résumé incompleteness.

### AD-010: Typed Error Codes

- All errors defined in `@resume-lens/shared`. No magic strings.
- HTTP status codes map to error conditions (415 = unsupported file type, 413 = file too large, 422 = unparseable, 503 = throttled, 502 = Bedrock error, 422 = parse failure).
- Frontend renders actionable messages per code.

### AD-011: Lambda Memory

- 512MB fixed. Right-sized for this workload. Cold start stability matters for portfolio demo.

---

## Code Organization

### `packages/shared`

- Single responsibility: the contract between frontend and backend.
- Zero runtime dependencies.
- Contains:
  - `types/resume.ts` — canonical `ResumeExtraction` interface.
  - `errors/error-codes.ts` — typed error enum.
- All other packages import from here.

### `packages/api`

- Three services + one handler:
  - **Intake service**: File type + size validation. Returns typed errors.
  - **Parser service**: `pdf-parse` → raw text string. Error-tolerant parsing.
  - **Extraction service**: Prompt construction + Bedrock call. Structured JSON extraction.
  - **Handler**: Orchestrates the three-service pipeline. Entry point for Lambda.
- Dependencies: `@resume-lens/shared`, `pdf-parse`, AWS SDK (Bedrock client).
- No third-party web frameworks.

### `packages/web`

- Vanilla React + Vite. No routing library (single-screen app).
- Three components:
  - **UploadForm**: Drag-drop, file picker, PDF-only validation, 5MB check.
  - **LoadingState**: Skeleton/spinner during extraction.
  - **ResultCard**: Renders `ResumeExtraction` JSON visually.
- Single API client in `api/client.ts` — typed against `@resume-lens/shared`.

### `infra/`

- One AWS CDK stack (TypeScript) provisioning all resources.
- Resources: Lambda + API Gateway + S3 + CloudFront + IAM roles.
- **Scope**: Intentionally minimal. Infrastructure is a signal; keep it clean.

---

## Development Principles

1. **TypeScript everywhere**: Shared type definitions across packages enforce the contract at compile time.
2. **Explicit nullability**: Optional fields are `null`, not `undefined`. Schema reflects reality.
3. **No magic strings**: Error codes, model IDs, and status values are typed enums or literal unions.
4. **Synchronous clarity**: No async queues, no event-driven complexity. Single request → result.
5. **Confidence transparency**: Extraction results include per-section confidence signals (`high | medium | low`).
6. **Portfolio positioning**: Every decision trades off simplicity vs. realism. Realism wins where it demonstrates judgment (e.g., Bedrock IAM over direct API; CDK IaC over console).

---

## Build Order (Recommended)

1. `packages/shared` — types and error codes first. Everything depends on this.
2. `packages/api` — handler + services. Test locally before deploying.
3. `infra/` — CDK stack. Deploy Lambda + API Gateway. Validate end-to-end.
4. `packages/web` — build against deployed API. Deploy to S3/CloudFront last.

---

## Key Files

- [Architecture Decisions](./docs/architecural-decisions.md) — authoritative log of all design rationale (AD-001 through AD-012).
- [Project Overview](./docs/project-overview.md) — summary of purpose, tech stack, data flow, error handling, cost profile.
- `packages/shared/src/types/resume.ts` — the extraction output contract.
- `packages/api/src/handlers/extract-handler.ts` — Lambda entry point.
- `infra/lib/resume-lens-stack.ts` — CDK stack definition.

---

## Cost & Scale

- **Demo scale**: \~100 invocations/month.
- **Estimated cost**: \< $0.10/month (Lambda + Bedrock + S3 + CloudFront).
- **Lambda cold start**: Expected 1–2s (TypeScript + pdf-parse cold start).
- **Extraction latency**: 3–5s (Bedrock call).
- **Total round-trip**: 4–7s.

---

## When to Escalate

- **Extraction quality degrades on real-world résumés** → Escalate from Haiku to Claude 3 Sonnet. Document in AD-012.
- **Lambda memory insufficient** → Monitor cold start failures. Scale to 1GB if needed (cost impact: \< $0.01/month at demo scale).
- **Résumés exceed 5MB regularly** → Adjust cap. Document rationale in AD-007.

---

## Coding Standards

- **Function syntax**: Use arrow functions (`const fn = () => {}`) exclusively. Ensures consistent scoping and modern TypeScript idiom.
- **Modules vs. classes**: Use exported functions (modules) rather than classes with only static methods. Classes are for object-oriented programming with instance state; services are functional modules with no state.
- **Naming**: camelCase for functions, PascalCase for types/interfaces/enums.
- **Error handling**: All errors propagate as typed codes defined in `@resume-lens/shared`. No untyped exceptions in external API responses.
- **Logging**: Structured logs only (JSON format preferred). Include `extractionMeta.processedAt` and `modelId` in all extraction logs.
- **Comments**: Explain _why_, not _what_. Code is clear; comments justify trade-offs.
- **Barrel files**: Do **not** use `index.ts` for public exports in each package. Explicitly export from named files for clarity and better tree-shaking.
- **Tests**: None required for this portfolio scope.
