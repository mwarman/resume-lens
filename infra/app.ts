import * as cdk from 'aws-cdk-lib';

import { ResumeLensStack } from './src/stacks/resume-lens-stack.ts';

const app = new cdk.App();

new ResumeLensStack(app, 'ResumeLensStack', {
  description: 'Infrastructure for resume-lens AI extraction service',
  env: {
    account: process.env.CDK_DEFAULT_ACCOUNT,
    region: process.env.CDK_DEFAULT_REGION || 'us-east-1',
  },
});
