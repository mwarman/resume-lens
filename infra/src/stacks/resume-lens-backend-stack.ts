import * as path from 'path';
import * as cdk from 'aws-cdk-lib';
import * as lambda from 'aws-cdk-lib/aws-lambda';
import * as logs from 'aws-cdk-lib/aws-logs';
import * as apigateway from 'aws-cdk-lib/aws-apigateway';
import * as iam from 'aws-cdk-lib/aws-iam';
import { NodejsFunction } from 'aws-cdk-lib/aws-lambda-nodejs';
import { Construct } from 'constructs';

/**
 * ResumeLensBackendStack
 *
 * Provisions the backend AWS resources for the resume-lens application:
 * - Lambda function for PDF extraction via Claude on Bedrock
 * - API Gateway for HTTP access to the extraction service
 * - IAM roles and policies for Bedrock access
 *
 * Outputs:
 * - ApiGatewayUrl: The base URL of the API Gateway (used by frontend for API calls)
 */
export class ResumeLensBackendStack extends cdk.Stack {
  public readonly apiGatewayUrl: string;

  constructor(scope: Construct, id: string, props?: cdk.StackProps) {
    super(scope, id, props);

    // Create the extract Lambda function
    const extractFunction = new NodejsFunction(this, 'ExtractFunction', {
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
    // Grant bedrock:InvokeModel permission to invoke the Claude model
    extractFunction.role?.attachInlinePolicy(
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
    const lambdaIntegration = new apigateway.LambdaIntegration(extractFunction);
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
    // Initially allows all origins for the initial deployment.
    // After the frontend stack is deployed, update this to the CloudFront domain for security:
    // allowOrigins: [`https://{cloudFrontDomain}`]
    extractResource.addCorsPreflight({
      allowOrigins: ['*'],
      allowMethods: ['POST'],
      allowHeaders: ['Content-Type'],
    });

    // Store the API Gateway URL for use by the frontend stack
    this.apiGatewayUrl = api.url;

    // Output the API Gateway URL (will be used by frontend stack during build)
    new cdk.CfnOutput(this, 'ApiGatewayUrl', {
      description: 'API Gateway base URL for resume extraction',
      value: api.url,
      exportName: 'ResumeLensApiUrl',
    });
  }
}
