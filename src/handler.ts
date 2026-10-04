import awsLambdaFastify from '@fastify/aws-lambda';

import { buildApp } from './app';

const app = buildApp({ enableStatic: false });

export const handler = awsLambdaFastify(app);
