import * as trpcExpress from '@trpc/server/adapters/express';
export declare const createContext: ({ req, res }: trpcExpress.CreateExpressContextOptions) => Promise<{
    prisma: import("@prisma/client").PrismaClient<import("@prisma/client").Prisma.PrismaClientOptions, never, import("@prisma/client/runtime/library").DefaultArgs>;
    user: {
        id: string;
        email: string;
        password: string;
        name: string | null;
        phone: string | null;
        role: import("@prisma/client").$Enums.UserRole;
        isKycVerified: boolean;
        createdAt: Date;
        updatedAt: Date;
    } | null;
    userId: any;
}>;
export type Context = Awaited<ReturnType<typeof createContext>>;
//# sourceMappingURL=trpc.d.ts.map