import express from 'express';
import * as trpcExpress from '@trpc/server/adapters/express';
import { appRouter } from './server/index.js';
import { createContext } from './server/context.js';
import { createOpenApiExpressMiddleware, generateOpenApiDocument } from 'trpc-to-openapi';
import fs from 'fs/promises';
const app = express();
app.use(express.json());
const openApiDocument = generateOpenApiDocument(appRouter, {
    baseUrl: "http://localhost:8000/api",
    title: "My API",
    version: "1.0.0",
});
app.get('/openapi.json', (req, res) => {
    res.json(openApiDocument);
});
app.use('/api', createOpenApiExpressMiddleware({
    router: appRouter,
    createContext,
}));
app.use('/trpc', trpcExpress.createExpressMiddleware({
    router: appRouter,
    createContext,
}));
fs.writeFile('./openapi.json', JSON.stringify(openApiDocument));
app.get('/', (req, res) => {
    res.json({ message: 'Hello, World!' });
});
app.listen(8000, () => {
    console.log('Server is running on port 8000');
});
//# sourceMappingURL=index.js.map