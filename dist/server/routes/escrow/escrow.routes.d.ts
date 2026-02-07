export declare const escrowRouter: import("@trpc/server").TRPCBuiltRouter<{
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
     * STEP 3: PAY ESCROW
     */
    PayEscrow: import("@trpc/server").TRPCMutationProcedure<{
        input: {
            applicationId: string;
            amount: number;
            paymentId: string;
            commission: number;
        };
        output: {
            success: boolean;
            message: string;
            escrow: {
                id: string;
                applicationId: string;
                amount: number;
                status: "HOLDING" | "RELEASED" | "REFUNDED";
            };
            landStatus: "AVAILABLE" | "IN_NEGOTIATION" | "LEASED" | "HIDDEN";
        };
        meta: import("trpc-to-openapi").OpenApiMeta;
    }>;
    /**
     * STEP 4: VERIFY MALPOT PAPERS
     */
    VerifyMalpotPapers: import("@trpc/server").TRPCMutationProcedure<{
        input: {
            applicationId: string;
            malpotPaperUrl: string;
            adminId: string;
        };
        output: {
            success: boolean;
            message: string;
            application: {
                id: string;
                status: "PENDING" | "ACCEPTED" | "REJECTED" | "COMPLETED";
            };
            landStatus: "AVAILABLE" | "IN_NEGOTIATION" | "LEASED" | "HIDDEN";
            escrowStatus: "HOLDING" | "RELEASED" | "REFUNDED";
        };
        meta: import("trpc-to-openapi").OpenApiMeta;
    }>;
}>>;
//# sourceMappingURL=escrow.routes.d.ts.map