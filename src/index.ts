import express from 'express';
import swaggerUi from 'swagger-ui-express';
import * as trpcExpress from '@trpc/server/adapters/express';
import { createOpenApiExpressMiddleware, generateOpenApiDocument } from 'trpc-to-openapi';
import { clerkMiddleware } from '@clerk/express';
import { appRouter } from './server/index.js';
import { createContext } from './server/context.js';
import morgan from 'morgan';
import fs from 'fs/promises';
import cors from 'cors';

const app = express();

app.use(morgan('dev'));
app.use(cors({
  origin: 'http://localhost:3000', // Your Next.js URL
  credentials: true,
}));
app.use(express.json());

// Clerk middleware MUST be before trpc/openapi
app.use(clerkMiddleware());

// 1. Generate OpenAPI Spec
const openApiDocument = generateOpenApiDocument(appRouter, {
  baseUrl: 'http://localhost:8000/api',
  title: 'Land Lease API',
  version: '1.0.0',
  // This adds the "Authorize" button to Swagger for Clerk JWTs
  securitySchemes: {
    bearerAuth: {
      type: 'http',
      scheme: 'bearer',
      bearerFormat: 'JWT',
    },
  },
});

// 2. Write OpenAPI Spec to file (openapi.json)
try {
  await fs.writeFile(
    './openapi.json',
    JSON.stringify(openApiDocument, null, 2),
    'utf-8'
  );
  console.log('✅ openapi.json has been generated and saved.');
} catch (error) {
  console.error('❌ Error writing openapi.json:', error);
}

// 3. REST API Endpoint (via trpc-to-openapi)
app.use('/api', createOpenApiExpressMiddleware({
  router: appRouter,
  createContext,
}));

// 4. Standard tRPC Endpoint
app.use('/trpc', trpcExpress.createExpressMiddleware({
  router: appRouter,
  createContext,
}));

// 5. Swagger UI
app.use('/docs', swaggerUi.serve, swaggerUi.setup(openApiDocument));

// Optional: Serve the JSON file directly at a route
app.get('/openapi.json', (req, res) => {
  res.json(openApiDocument);
});

const PORT = 8000;
app.listen(PORT, () => {
  console.log(`🚀 Server running on http://localhost:${PORT}`);
  console.log(`📖 Swagger docs at http://localhost:${PORT}/docs`);
  console.log(`📄 Raw OpenAPI JSON at http://localhost:${PORT}/openapi.json`);
});