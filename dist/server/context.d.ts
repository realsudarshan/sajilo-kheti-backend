import * as trpcExpress from '@trpc/server/adapters/express';
export declare const createContext: ({ req, res }: trpcExpress.CreateExpressContextOptions) => Promise<{
    prisma: import("@prisma/client").PrismaClient<import("@prisma/client").Prisma.PrismaClientOptions, never, import("@prisma/client/runtime/library").DefaultArgs>;
    user: {
        id: string;
        role: import("@prisma/client").$Enums.UserRole;
    } | null;
    userId: string | null;
}>;
export type Context = Awaited<ReturnType<typeof createContext>>;
//# sourceMappingURL=context.d.ts.map