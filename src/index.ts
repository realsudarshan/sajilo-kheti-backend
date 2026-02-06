import express from 'express';
import swaggerUi from 'swagger-ui-express';
import * as trpcExpress from '@trpc/server/adapters/express';
import { createOpenApiExpressMiddleware, generateOpenApiDocument } from 'trpc-to-openapi';
import { clerkMiddleware } from '@clerk/express';
import { appRouter } from './server/index.js';
import { createContext } from './server/context.js';
import fs from 'fs/promises';
const app = express();
app.use(express.json());

// Clerk middleware MUST be before trpc/openapi
app.use(clerkMiddleware());

// 1. Generate OpenAPI Spec
const openApiDocument = generateOpenApiDocument(appRouter, {
  baseUrl: 'http://localhost:8000/api',
  title: 'Land Lease API',
  version: '1.0.0',
});

// 2. REST API Endpoint (via trpc-to-openapi)
app.use('/api', createOpenApiExpressMiddleware({
  router: appRouter,
  createContext,
}));

// 3. Standard tRPC Endpoint
app.use('/trpc', trpcExpress.createExpressMiddleware({
  router: appRouter,
  createContext,
}));

// 4. Swagger UI
app.use('/docs', swaggerUi.serve, swaggerUi.setup(openApiDocument));

app.listen(8000, () => {
  console.log('🚀 Server running on http://localhost:8000');
  console.log('📖 Swagger docs at http://localhost:8000/docs');
});

