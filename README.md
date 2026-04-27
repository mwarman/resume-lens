# resume-lens

A portfolio piece demonstrating production-grade AI integration at AWS scale.

Upload a PDF résumé → receive structured, typed JSON extraction of the candidate's profile, including an AI-inferred seniority level computed by Claude Haiku on AWS Bedrock.

## 📋 Overview

**resume-lens** is a monorepo showcasing:

- Synchronous PDF extraction via AWS Lambda
- Structured JSON output with confidence signals
- TypeScript end-to-end (frontend, backend, infrastructure)
- AWS CDK infrastructure as code

## 🏗️ Architecture

| Component      | Technology                 | Notes                           |
| -------------- | -------------------------- | ------------------------------- |
| Frontend       | React + Vite               | Vanilla SPA, S3 + CloudFront    |
| API            | Lambda (TypeScript)        | 512MB, ~6s round-trip latency   |
| PDF parsing    | `unpdf` (npm)              | In-process, no external service |
| AI provider    | AWS Bedrock (Claude Haiku) | On-demand, IAM-authenticated    |
| Infrastructure | AWS CDK (TypeScript)       | Single stack                    |

## 📦 Monorepo Structure

```
packages/
├── shared/          # Shared TypeScript types, error codes
├── api/             # Lambda handler + extraction services
└── web/             # React SPA
infra/
└── cdk stack        # AWS resource provisioning
```

## 🚀 Quick Start

### Prerequisites

- Node.js 24.15.0 (use `nvm use`)
- npm 10+

### Installation

```bash
npm install
```

## 📚 Documentation

- [Project Overview](./docs/project-overview.md) — detailed tech stack, architecture, data flow
- [Architecture Decisions](./docs/architecural-decisions.md) — design rationale for all major choices
- [Copilot Instructions](./github/copilot-instructions.md) — development guidance and coding standards

## 📖 Build Order

1. `packages/shared` — types and error codes first
2. `packages/api` — Lambda handler and services
3. `infra/` — AWS CDK stack deployment
4. `packages/web` — React SPA

## 💰 Cost Profile

Estimated monthly cost at demo scale (~100 invocations):

- Lambda: ~$0.01
- API Gateway: ~$0.00
- Bedrock (Claude 3 Haiku): ~$0.05
- S3 + CloudFront: ~$0.02
- **Total: < $0.10/month**

## 📝 License

MIT
