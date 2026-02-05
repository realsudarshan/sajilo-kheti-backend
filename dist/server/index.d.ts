export declare const appRouter: import("@trpc/server").TRPCBuiltRouter<{
    ctx: {
        prisma: import("@prisma/client").PrismaClient<import("@prisma/client").Prisma.PrismaClientOptions, never, import("@prisma/client/runtime/library").DefaultArgs>;
        user: {
            id: string;
            role: import("@prisma/client").$Enums.UserRole;
        } | null;
    };
    meta: import("trpc-to-openapi").OpenApiMeta;
    errorShape: import("@trpc/server").TRPCDefaultErrorShape;
    transformer: false;
}, import("@trpc/server").TRPCDecorateCreateRouterOptions<{
    user: import("@trpc/server").TRPCBuiltRouter<{
        ctx: {
            prisma: import("@prisma/client").PrismaClient<import("@prisma/client").Prisma.PrismaClientOptions, never, import("@prisma/client/runtime/library").DefaultArgs>;
            user: {
                id: string;
                role: import("@prisma/client").$Enums.UserRole;
            } | null;
        };
        meta: import("trpc-to-openapi").OpenApiMeta;
        errorShape: import("@trpc/server").TRPCDefaultErrorShape;
        transformer: false;
    }, import("@trpc/server").TRPCDecorateCreateRouterOptions<{
        getAllUser: import("@trpc/server").TRPCQueryProcedure<{
            input: undefined;
            output: {
                users: {
                    id: string;
                    name: string | null;
                    email: string;
                    phone: string | null;
                    role: string;
                    createdAt: Date;
                }[];
            };
            meta: import("trpc-to-openapi").OpenApiMeta;
        }>;
        createUser: import("@trpc/server").TRPCMutationProcedure<{
            input: {
                id: string;
                email: string;
                password: string;
                name?: string | undefined;
                phone?: string | undefined;
                role?: "LEASER" | "OWNER" | "ADMIN" | undefined;
            };
            output: {
                id: string;
                email: string;
                name: string | null;
                phone: string | null;
                role: string;
                createdAt: Date;
            };
            meta: import("trpc-to-openapi").OpenApiMeta;
        }>;
        upgradeRequest: import("@trpc/server").TRPCMutationProcedure<{
            input: {
                userId: string;
                citizenshipNumber: string;
                documentUrl: string;
                selfieUrl?: string | undefined;
            };
            output: {
                id: string;
                userId: string;
                status: string;
                citizenshipNumber: string;
                documentUrl: string;
                selfieUrl: string | null;
            };
            meta: import("trpc-to-openapi").OpenApiMeta;
        }>;
        updateKycStatus: import("@trpc/server").TRPCMutationProcedure<{
            input: {
                userId: string;
                status: "PENDING" | "APPROVED" | "REJECTED";
            };
            output: {
                userId: string;
                kycStatus: string;
                userRole: string;
                isKycVerified: boolean;
            };
            meta: import("trpc-to-openapi").OpenApiMeta;
        }>;
    }>>;
}>>;
export type AppRouter = typeof appRouter;
//# sourceMappingURL=index.d.ts.map