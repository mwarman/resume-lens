import * as path from 'path';
import * as cdk from 'aws-cdk-lib';
import * as s3 from 'aws-cdk-lib/aws-s3';
import * as cloudfront from 'aws-cdk-lib/aws-cloudfront';
import * as origins from 'aws-cdk-lib/aws-cloudfront-origins';
import * as s3_deployment from 'aws-cdk-lib/aws-s3-deployment';
import { Construct } from 'constructs';

/**
 * ResumeLensFrontendStack
 *
 * Provisions the frontend AWS resources for the resume-lens application:
 * - S3 bucket for static website hosting (private, block all public access)
 * - CloudFront distribution for CDN
 * - BucketDeployment to sync built web assets
 *
 * This stack depends on the backend stack being deployed first.
 * It builds the web package with the API Gateway URL before deploying to S3/CloudFront.
 *
 * Outputs:
 * - CloudFrontUrl: The CloudFront distribution URL for accessing the web application
 */
export class ResumeLensFrontendStack extends cdk.Stack {
  constructor(scope: Construct, id: string, props?: cdk.StackProps) {
    super(scope, id, props);

    // Create the S3 bucket for static website hosting (private, block all public access)
    const websiteBucket = new s3.Bucket(this, 'WebsiteBucket', {
      bucketName: `resume-lens-web-${cdk.Stack.of(this).account}-${cdk.Stack.of(this).region}`,
      blockPublicAccess: s3.BlockPublicAccess.BLOCK_ALL,
      removalPolicy: cdk.RemovalPolicy.DESTROY,
      autoDeleteObjects: true,
    });

    // Create the CloudFront distribution
    // The S3BucketOrigin construct automatically handles Origin Access Control (OAC) and bucket policy
    // to ensure secure access from CloudFront while keeping the S3 bucket private
    const distribution = new cloudfront.Distribution(this, 'WebsiteDistribution', {
      comment: 'CDN for resume-lens frontend',
      defaultRootObject: 'index.html',
      defaultBehavior: {
        origin: origins.S3BucketOrigin.withOriginAccessControl(websiteBucket),
        viewerProtocolPolicy: cloudfront.ViewerProtocolPolicy.REDIRECT_TO_HTTPS,
        cachePolicy: cloudfront.CachePolicy.CACHING_OPTIMIZED,
      },
      errorResponses: [
        {
          httpStatus: 404,
          responseHttpStatus: 200,
          responsePagePath: '/index.html',
          ttl: cdk.Duration.minutes(5),
        },
      ],
      priceClass: cloudfront.PriceClass.PRICE_CLASS_100, // Use the lowest cost edge locations (US, Canada, Europe)
    });

    // Deploy the web package to S3 and invalidate CloudFront cache on updates
    new s3_deployment.BucketDeployment(this, 'WebsiteDeployment', {
      sources: [s3_deployment.Source.asset(path.join(import.meta.dirname, '../../../packages/web/dist'))],
      destinationBucket: websiteBucket,
      distribution: distribution,
      distributionPaths: ['/*'],
    });

    // Output the CloudFront distribution URL
    new cdk.CfnOutput(this, 'CloudFrontUrl', {
      description: 'CloudFront distribution URL for accessing the web application',
      value: `https://${distribution.distributionDomainName}`,
      exportName: 'ResumeLensCloudFrontUrl',
    });
  }
}
