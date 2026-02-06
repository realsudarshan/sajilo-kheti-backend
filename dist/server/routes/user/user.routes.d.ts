export declare const userRouter: import("@trpc/server").TRPCBuiltRouter<{
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
    /**
     * GET ALL USERS
     * Restricted to Admin only for privacy.
     */
    getAllUser: import("@trpc/server").TRPCQueryProcedure<{
        input: void;
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
    /**
     * CREATE / SYNC USER
     * Usually called via a Clerk Webhook or the first time a user logs in.
     */
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
    /**
     * UPGRADE REQUEST (KYC SUBMISSION)
     * Only the logged-in user can submit for themselves.
     */
    upgradeRequest: import("@trpc/server").TRPCMutationProcedure<{
        input: {
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
    /**
     * UPDATE KYC STATUS
     * Admin reviews the Lalpurja/Citizenship and upgrades the user.
     */
    updateKycStatus: import("@trpc/server").TRPCMutationProcedure<{
        input: {
            userId: string;
            status: "PENDING" | "REJECTED" | "APPROVED";
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
//# sourceMappingURL=user.routes.d.ts.map