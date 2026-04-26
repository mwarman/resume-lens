import * as cdk from 'aws-cdk-lib';
import { Construct } from 'constructs';

/**
 * ResumeLensStack
 *
 * Provisions all AWS resources for the resume-lens application:
 * - Lambda function for PDF extraction
 * - API Gateway for HTTP access
 * - S3 bucket for static website hosting
 * - CloudFront distribution for CDN
 * - IAM roles and policies
 */
export class ResumeLensStack extends cdk.Stack {
  constructor(scope: Construct, id: string, props?: cdk.StackProps) {
    super(scope, id, props);

    // Stack placeholder for future resource definitions
  }
}
