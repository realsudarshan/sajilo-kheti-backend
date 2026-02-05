import * as trpcExpress from '@trpc/server/adapters/express';
export declare const createContext: ({ req, res, }: trpcExpress.CreateExpressContextOptions) => {};
export type Context = Awaited<ReturnType<typeof createContext>>;
//# sourceMappingURL=context.d.ts.map