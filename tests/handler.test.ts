import { describe, expect, it } from 'vitest';

import { handler } from '../src/handler';

describe('Lambda handler', () => {
  it('adapts an API Gateway HTTP API event', async () => {
    const response = await handler({
      version: '2.0',
      routeKey: 'POST /game',
      rawPath: '/game',
      rawQueryString: '',
      headers: {},
      requestContext: {
        accountId: 'test',
        apiId: 'test',
        domainName: 'test.execute-api.local',
        domainPrefix: 'test',
        http: { method: 'POST', path: '/game', protocol: 'HTTP/1.1', sourceIp: '127.0.0.1', userAgent: 'test' },
        requestId: 'test',
        routeKey: 'POST /game',
        stage: '$default',
        time: '03/Oct/2026:00:00:00 +0000',
        timeEpoch: Date.now()
      },
      isBase64Encoded: false
    } as any, {} as any, (() => undefined) as any);

    expect(response.statusCode).toBe(201);
    expect(JSON.parse(response.body).state.heroes).toHaveLength(3);
  });
});
