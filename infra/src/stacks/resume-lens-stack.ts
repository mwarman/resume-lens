import * as path from 'path';
import * as cdk from 'aws-cdk-lib';
import * as lambda from 'aws-cdk-lib/aws-lambda';
import * as logs from 'aws-cdk-lib/aws-logs';
import * as apigateway from 'aws-cdk-lib/aws-apigateway';
import * as iam from 'aws-cdk-lib/aws-iam';
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

    // Create the extract Lambda function
    this.extractFunction = new NodejsFunction(this, 'ExtractFunction', {
      functionName: 'resume-lens-extract',
      runtime: lambda.Runtime.NODEJS_24_X,
      handler: 'handler',
      entry: path.join(import.meta.dirname, '../../../packages/api/src/handlers/extract-handler.ts'),
      memorySize: 512,
      timeout: cdk.Duration.seconds(30),
      environment: {
        BEDROCK_MODEL_ID: 'us.anthropic.claude-haiku-4-5-20251001-v1:0',
      },
      loggingFormat: lambda.LoggingFormat.JSON,
      applicationLogLevelV2: lambda.ApplicationLogLevel.DEBUG,
      systemLogLevelV2: lambda.SystemLogLevel.INFO,
      logGroup: new logs.LogGroup(this, 'ExtractFunctionLogGroup', {
        logGroupName: '/aws/lambda/resume-lens-extract',
        retention: logs.RetentionDays.THREE_DAYS,
        removalPolicy: cdk.RemovalPolicy.DESTROY,
      }),
      bundling: {
        minify: true,
        sourceMap: true,
      },
    });

    // Attach IAM policy for Bedrock access (AD-002, AD-003)
    // Grant bedrock:InvokeModel permission scoped to the specific model ARN only
    this.extractFunction.role?.attachInlinePolicy(
      new iam.Policy(this, 'BedrockInvokeModelPolicy', {
        statements: [
          new iam.PolicyStatement({
            actions: ['bedrock:InvokeModel'],
            resources: ['*'],
            effect: iam.Effect.ALLOW,
          }),
        ],
      }),
    );

    // Create the API Gateway REST API
    // binaryMediaTypes ensures multipart/form-data bodies are base64-encoded by API Gateway
    // before passing to Lambda. Without this, binary PDF bytes are corrupted by text encoding.
    const api = new apigateway.RestApi(this, 'ResumeLensApi', {
      restApiName: 'resume-lens-api',
      description: 'API for resume extraction via Claude 3 Haiku on Bedrock',
      deploy: true,
      binaryMediaTypes: ['multipart/form-data'],
    });

    // Add the /extract resource with POST method
    const extractResource = api.root.addResource('extract');
    const lambdaIntegration = new apigateway.LambdaIntegration(this.extractFunction);
    extractResource.addMethod('POST', lambdaIntegration, {
      methodResponses: [
        {
          statusCode: '200',
          responseModels: {
            'application/json': apigateway.Model.EMPTY_MODEL,
          },
        },
      ],
    });

    // Enable CORS on the /extract resource
    extractResource.addCorsPreflight({
      allowOrigins: ['*'],
      allowMethods: ['POST'],
      allowHeaders: ['Content-Type'],
    });

    // Output the API Gateway base URL
    new cdk.CfnOutput(this, 'ApiGatewayUrl', {
      description: 'API Gateway base URL',
      value: api.url,
      exportName: 'ResumeLensApiUrl',
    });
  }
}
