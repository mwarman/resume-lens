# resume-lens — Architecture Decisions

This document is the authoritative log of all architectural and design decisions made for the `resume-lens` project. Each entry records the decision, the alternatives considered, the rationale, and any constraints that drove the choice.

New decisions should be appended in the same format as sessions progress.

---

## **AD-001 — Monorepo structure**

**Decision:** Use a monorepo with npm workspaces (`packages/shared`, `packages/api`, `packages/web`, `infra/`).

**Alternatives considered:**

- Separate repositories per component

**Rationale:** The project's primary purpose is to tell a coherent architectural story for a portfolio audience. A single repository allows a reviewer to clone once and see the full system. Shared TypeScript types between frontend and backend (`@resume-lens/shared`) are a concrete, demonstrable benefit — the API contract is enforced at compile time across both packages. The standard monorepo pain points (conflicting release cycles, team ownership conflicts, CI complexity) do not apply at this scale and audience.

**Constraints:** Demo/portfolio project; single developer; no independent deployment cadence required between packages.

---

## **AD-002 — AI provider: AWS Bedrock**

**Decision:** Use AWS Bedrock (Claude 4.x Haiku) as the AI provider.

**Alternatives considered:**

- Anthropic API (direct)

**Rationale:** Bedrock keeps the entire solution AWS-native, which is consistent with the portfolio positioning (AWS-certified architect). IAM-based authentication (Lambda execution role) means no API keys in code or environment variables — a meaningful security signal for an enterprise audience. Claude 4 Haiku is the lowest-cost Bedrock model with sufficient capability for structured JSON extraction from résumé text.

**Trade-off acknowledged:** Bedrock setup requires more AWS configuration than a direct Anthropic API key. For a demo with no audience, Anthropic direct would be simpler. Bedrock is the right choice here because the AWS configuration complexity is itself a portfolio signal.

---

## **AD-003 — Document storage: no persistence**

**Decision:** No persistence layer. Documents are held in Lambda memory for the duration of a single invocation only.

**Alternatives considered:**

- S3 upload → async processing pipeline
- S3 upload → synchronous processing with stored results

**Rationale:** Persistence adds a full infrastructure layer (S3 bucket, object lifecycle, result storage, retrieval API) without adding meaningful demonstration value for this project's focus (AI integration patterns). The synchronous upload → process → return flow is architecturally cleaner and easier to reason about. Async processing would be a better fit for a project demonstrating event-driven architecture, which is a different portfolio piece.

**Constraints:** Demo project; no requirement to retrieve past extractions; simplicity is a stated priority.

---

## **AD-004 — API framework: Plain TypeScript Lambda Handlers**

**Decision:** Plain TypeScript Lambda handlers. The three-stage pipeline (Intake → Parser → Extraction) is implemented as discrete modules invoked in sequence. NestJS was considered and rejected — the added cold start penalty, bundle size, and framework complexity are not justified by a two-route Lambda function.

**Alternatives considered:**

- NestJS via serverless-http on Lambda

**Rationale:** Bare Lambda handlers are the cleanest approach and are simpler for long-term maintenance.

**Trade-off acknowledged:** While NestJS could possibly add more clarity and familiarity for engineers, NestJS adds cold start latency and bundle size compared to bare handlers. For a production high-throughput service, the bare Lambda handlers are better suited.

---

## **AD-005 — Frontend: React \+ Vite, hosted on S3 \+ CloudFront**

**Decision:** Vanilla React with Vite build tooling, deployed as a static SPA to S3 \+ CloudFront.

**Alternatives considered:**

- Next.js (SSR/SSG) hosted on Vercel or Lambda@Edge

**Rationale:** The frontend has no server-rendering requirements — it is a single-page upload \+ results viewer. Next.js would add framework complexity without adding capability. Vite produces a clean static build. S3 \+ CloudFront keeps the entire stack AWS-native and near-zero cost at demo scale. No routing library is needed given the single-screen interaction model.

**Trade-off acknowledged:** Next.js would signal full-stack framework experience. That signal is better demonstrated in a different, more appropriate project rather than forcing it here.

---

## **AD-006 — Infrastructure as code: AWS CDK (TypeScript)**

**Decision:** Single AWS CDK stack written in TypeScript (`infra/lib/resume-lens-stack.ts`).

**Alternatives considered:**

- AWS SAM
- No IaC (console provisioning)

**Rationale:** CDK in TypeScript is consistent with the rest of the stack — a reviewer reads one language throughout the entire repository. IaC is a meaningful portfolio signal that separates engineers who write application code from those who own full delivery. SAM is lighter but less impressive for a senior/architect positioning. Skipping IaC entirely is a missed opportunity given the audience.

**Scope constraint:** One stack, kept intentionally minimal. CDK complexity should not exceed what is justified by the application's infrastructure requirements.

---

## **AD-007 — PDF-only file support**

**Decision:** Accept PDF files only. 5MB size cap.

**Alternatives considered:**

- PDF \+ DOCX
- PDF \+ DOCX \+ plain text

**Rationale:** Adding DOCX support would require a second parsing library and format-specific handling branches in the parser module. For a focused demo, that complexity is not justified by the marginal realism gain. PDF is the dominant résumé format in professional contexts. The 5MB cap is generous for any realistic résumé PDF (typical: 100–500KB) while providing a clear upper boundary for Lambda memory planning.

---

## **AD-008 — Synchronous request/response (no streaming)**

**Decision:** Synchronous JSON response. No SSE or WebSocket streaming.

**Alternatives considered:**

- Server-Sent Events (SSE) for progressive result rendering

**Rationale:** Résumés are short documents. Bedrock extraction latency is expected to be 3–5 seconds — short enough that streaming offers no meaningful UX improvement and would read as artificial complexity. A clean loading state (spinner/skeleton) followed by a full result render is the correct UX pattern for this latency range. Streaming would add Lambda response mode complexity and frontend EventSource handling for no genuine user benefit.

---

## **AD-009 — Extraction output schema**

**Decision:** Fixed schema extraction with one AI-inferred field. See `packages/shared/src/types/resume.ts` for the canonical `ResumeExtraction` interface.

**Key design choices within the schema:**

- `inferredSeniorityLevel` (`'junior' | 'mid' | 'senior' | 'principal' | 'unknown'`) — computed by the model from holistic reading of experience, titles, and skills. This field is the primary demonstration of AI inference vs. text parsing and is the natural conversation anchor in a portfolio review.
- `startDate` / `endDate` as `string | null` — ISO 8601 where inferrable from the résumé, raw string otherwise. Avoids silent data loss from strict date parsing when résumé formats are inconsistent.
- `extractionMeta.confidence` — per-section confidence signals (`experience`, `education`, `skills`) rated `high | medium | low`. Allows the frontend to surface uncertainty without exposing model internals. This detail signals extraction maturity.
- Nullable fields throughout — all optional candidate fields and all date fields are explicitly nullable. The schema reflects realistic résumé incompleteness rather than assuming clean input.

---

## **AD-010 — Error handling contract**

**Decision:** Typed error codes defined in `@resume-lens/shared`. Per-condition HTTP status codes. Frontend renders specific error messaging per code.

**Error conditions handled:**

| Code                       | HTTP | Condition                                 |
| :------------------------- | :--- | :---------------------------------------- |
| `UNSUPPORTED_FILE_TYPE`    | 415  | Non-PDF upload                            |
| `FILE_TOO_LARGE`           | 413  | Exceeds 5MB cap                           |
| `UNPARSEABLE_DOCUMENT`     | 422  | Corrupt or image-only PDF                 |
| `BEDROCK_THROTTLED`        | 503  | Bedrock rate limit (includes Retry-After) |
| `BEDROCK_ERROR`            | 502  | Upstream Bedrock service failure          |
| `EXTRACTION_PARSE_FAILURE` | 422  | Model returned non-conformant JSON        |

**Rationale:** Shared typed error codes prevent magic strings from appearing in the frontend. The frontend can render precise, actionable error messages without parsing error text. This is a standard enterprise API contract pattern and is worth demonstrating explicitly.

---

## **AD-011 — Lambda memory allocation**

**Decision:** 512MB Lambda memory.

**Rationale:** `unpdf` is memory-light. 512MB is right-sized for this workload — enough headroom for cold start stability without over-provisioning. At demo invocation volumes, the cost difference between 256MB and 512MB is negligible (\< $0.001/month).

---

## **AD-012 — Bedrock model selection: Claude 4.x Haiku**

**Decision:** Claude 4 Haiku via Bedrock for all extraction calls.

**Rationale:** Haiku is the lowest-cost Claude model available on Bedrock. For structured JSON extraction from clean text (résumé content extracted by `unpdf`), Haiku's capability is sufficient — this is not a reasoning-heavy task. Sonnet or Opus would add cost without adding meaningful extraction quality for well-formatted résumés. `modelId` is captured in `extractionMeta` on every response, making a future model upgrade traceable in output history.
