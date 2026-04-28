import * as cdk from 'aws-cdk-lib';

import { ResumeLensBackendStack } from './src/stacks/resume-lens-backend-stack.ts';
import { ResumeLensFrontendStack } from './src/stacks/resume-lens-frontend-stack.ts';

const app = new cdk.App();

// Create the backend stack
// This provisions the Lambda function and API Gateway for PDF extraction
const backendStack = new ResumeLensBackendStack(app, 'ResumeLensBackendStack', {
  description: 'Backend infrastructure for resume-lens AI extraction service (Lambda + API Gateway)',
  env: {
    account: process.env.CDK_DEFAULT_ACCOUNT,
    region: process.env.CDK_DEFAULT_REGION || 'us-east-1',
  },
});

// Create the frontend stack
// This builds the web package, provisions S3 + CloudFront, and deploys the built assets
new ResumeLensFrontendStack(app, 'ResumeLensFrontendStack', {
  description: 'Frontend infrastructure for resume-lens (S3 + CloudFront)',
  env: {
    account: process.env.CDK_DEFAULT_ACCOUNT,
    region: process.env.CDK_DEFAULT_REGION || 'us-east-1',
  },
});
