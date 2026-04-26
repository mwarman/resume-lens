import * as path from 'path';
import * as cdk from 'aws-cdk-lib';
import * as lambda from 'aws-cdk-lib/aws-lambda';
import * as logs from 'aws-cdk-lib/aws-logs';
import { NodejsFunction } from 'aws-cdk-lib/aws-lambda-nodejs';
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
  private extractFunction: NodejsFunction;

  constructor(scope: Construct, id: string, props?: cdk.StackProps) {
    super(scope, id, props);

    // Create the extract Lambda function (M3-2)
    this.extractFunction = new NodejsFunction(this, 'ExtractFunction', {
      functionName: 'resume-lens-extract',
      runtime: lambda.Runtime.NODEJS_24_X,
      handler: 'handler',
      entry: path.join(import.meta.dirname, '../../../packages/api/src/handlers/extract-handler.ts'),
      memorySize: 512,
      timeout: cdk.Duration.seconds(30),
      environment: {
        BEDROCK_MODEL_ID: 'anthropic.claude-haiku-4-5-20251001-v1:0',
      },
      loggingFormat: lambda.LoggingFormat.JSON,
      applicationLogLevelV2: lambda.ApplicationLogLevel.DEBUG,
      systemLogLevelV2: lambda.SystemLogLevel.INFO,
      logGroup: new logs.LogGroup(this, 'ExtractFunctionLogGroup', {
        logGroupName: '/aws/lambda/resume-lens-extract',
        retention: logs.RetentionDays.THREE_DAYS,
        removalPolicy: cdk.RemovalPolicy.DESTROY,
      }),
    });
  }
}
