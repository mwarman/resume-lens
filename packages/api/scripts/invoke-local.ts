import * as fs from 'fs';
import * as path from 'path';
import type { APIGatewayProxyEvent } from 'aws-lambda';
import { handler } from '../src/handlers/extract-handler';

/**
 * Local invocation script for testing the extract handler.
 *
 * Usage:
 *   npx ts-node scripts/invoke-local.ts [path/to/file.pdf]
 *
 * If no file is provided, uses a sample from ./sample-resume.pdf
 */
const main = async () => {
  const args = process.argv.slice(2);
  const filePath = args[0] || path.join(__dirname, 'sample-resume.pdf');

  if (!fs.existsSync(filePath)) {
    console.error(`Error: File not found: ${filePath}`);
    console.log('Usage: npx ts-node scripts/invoke-local.ts [path/to/file.pdf]');
    process.exit(1);
  }

  console.log(`Loading file: ${filePath}`);
  const fileBuffer = fs.readFileSync(filePath);
  const mimeType = 'application/pdf';
  const fileName = path.basename(filePath);

  // Construct a mock multipart/form-data body
  const boundary = '----FormBoundary123456789';
  const bodyParts: Buffer[] = [];

  bodyParts.push(Buffer.from(`--${boundary}\r\n`));
  bodyParts.push(Buffer.from(`Content-Disposition: form-data; name="file"; filename="${fileName}"\r\n`));
  bodyParts.push(Buffer.from(`Content-Type: ${mimeType}\r\n\r\n`));
  bodyParts.push(fileBuffer);
  bodyParts.push(Buffer.from(`\r\n--${boundary}--\r\n`));

  const body = Buffer.concat(bodyParts).toString('base64');

  const mockEvent: APIGatewayProxyEvent = {
    resource: '/extract',
    path: '/extract',
    httpMethod: 'POST',
    headers: {
      'content-type': `multipart/form-data; boundary=${boundary}`,
    },
    multiValueHeaders: {},
    queryStringParameters: null,
    multiValueQueryStringParameters: null,
    pathParameters: null,
    stageVariables: null,
    requestContext: {
      accountId: '123456789012',
      apiId: 'local',
      protocol: 'HTTP/1.1',
      httpMethod: 'POST',
      path: '/extract',
      stage: '$default',
      requestId: 'local-request-id',
      requestTime: new Date().toISOString(),
      requestTimeEpoch: Date.now(),
      identity: {
        sourceIp: '127.0.0.1',
      },
    } as any,
    body,
    isBase64Encoded: true,
  };

  console.log('Invoking handler...\n');

  try {
    const response = await handler(mockEvent, {} as any);
    console.log('Response:', JSON.stringify(response, null, 2));

    if (response.statusCode === 200 && response.body) {
      console.log('\nExtraction result:');
      console.log(JSON.stringify(JSON.parse(response.body), null, 2));
    }
  } catch (error) {
    console.error('Handler error:', error);
    process.exit(1);
  }
};

main();
