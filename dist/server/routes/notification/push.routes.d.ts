export declare const pushRouter: import("@trpc/server").TRPCBuiltRouter<{
    ctx: {
        prisma: import("@prisma/client").PrismaClient<import("@prisma/client").Prisma.PrismaClientOptions, never, import("@prisma/client/runtime/library").DefaultArgs>;
        user: {
            id: string;
            role: import("@prisma/client").$Enums.UserRole;
        } | null;
        userId: string | null;
    };
    meta: import("trpc-to-openapi").OpenApiMeta;
    errorShape: import("@trpc/server").TRPCDefaultErrorShape;
    transformer: false;
}, import("@trpc/server").TRPCDecorateCreateRouterOptions<{
    subscribe: import("@trpc/server").TRPCMutationProcedure<{
        input: {
            endpoint: string;
            keys: {
                p256dh: string;
                auth: string;
            };
        };
        output: {
            success: boolean;
            id: string;
        };
        meta: import("trpc-to-openapi").OpenApiMeta;
    }>;
    unsubscribe: import("@trpc/server").TRPCMutationProcedure<{
        input: {
            endpoint: string;
        };
        output: {
            success: boolean;
        };
        meta: import("trpc-to-openapi").OpenApiMeta;
    }>;
    testPush: import("@trpc/server").TRPCMutationProcedure<{
        input: void;
        output: {
            sent: number;
            successCount: number;
        };
        meta: import("trpc-to-openapi").OpenApiMeta;
    }>;
}>>;
//# sourceMappingURL=push.routes.d.ts.map