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
     * Now delegates to payEscrowService so the same logic
     * can be called from the Next.js API route too.
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
            landStatus: "AVAILABLE" | "UNVERIFIED" | "REJECTED" | "IN_NEGOTIATION" | "LEASED" | "HIDDEN";
        };
        meta: import("trpc-to-openapi").OpenApiMeta;
    }>;
    /**
     * STEP 4: VERIFY MALPOT PAPERS (Admin)
     */
    VerifyMalpotPapers: import("@trpc/server").TRPCMutationProcedure<{
        input: {
            applicationId: string;
            malpotPaperUrl: string;
            adminId?: string | undefined;
        };
        output: {
            success: boolean;
            message: string;
            application: {
                id: string;
                status: "REJECTED" | "PENDING" | "ACCEPTED" | "COMPLETED";
            };
            landStatus: "AVAILABLE" | "UNVERIFIED" | "REJECTED" | "IN_NEGOTIATION" | "LEASED" | "HIDDEN";
            escrowStatus: "HOLDING" | "RELEASED" | "REFUNDED";
        };
        meta: import("trpc-to-openapi").OpenApiMeta;
    }>;
    SaveChatChannel: import("@trpc/server").TRPCMutationProcedure<{
        input: {
            applicationId: string;
            chatChannelId: string;
        };
        output: {
            success: boolean;
            message: string;
        };
        meta: import("trpc-to-openapi").OpenApiMeta;
    }>;
    GetMyEscrows: import("@trpc/server").TRPCQueryProcedure<{
        input: Record<string, never>;
        output: {
            escrows: {
                id: string;
                applicationId: string;
                ownerId: string;
                leaserId: string;
                amount: number;
                paymentId: string | null;
                status: "HOLDING" | "RELEASED" | "REFUNDED";
                commission: number;
                chatChannelId: string | null;
                createdAt: Date;
                updatedAt: Date;
                application: {
                    id: string;
                    status: "REJECTED" | "PENDING" | "ACCEPTED" | "COMPLETED";
                    leaseDurationInMonths: number;
                    proposedMonthlyRent: number;
                    plans: string;
                    land: {
                        id: string;
                        title: string;
                        location: string;
                        heroImageUrl: string;
                        status: "AVAILABLE" | "UNVERIFIED" | "REJECTED" | "IN_NEGOTIATION" | "LEASED" | "HIDDEN";
                    };
                };
                landownerMalpotUrl?: string | null | undefined;
                landleaserMalpotUrl?: string | null | undefined;
            }[];
        };
        meta: import("trpc-to-openapi").OpenApiMeta;
    }>;
    GetMyOwnerEscrows: import("@trpc/server").TRPCQueryProcedure<{
        input: Record<string, never>;
        output: {
            escrows: {
                id: string;
                applicationId: string;
                ownerId: string;
                leaserId: string;
                amount: number;
                paymentId: string | null;
                status: "HOLDING" | "RELEASED" | "REFUNDED";
                commission: number;
                chatChannelId: string | null;
                createdAt: Date;
                updatedAt: Date;
                application: {
                    id: string;
                    status: "REJECTED" | "PENDING" | "ACCEPTED" | "COMPLETED";
                    leaseDurationInMonths: number;
                    proposedMonthlyRent: number;
                    plans: string;
                    land: {
                        id: string;
                        title: string;
                        location: string;
                        heroImageUrl: string;
                        status: "AVAILABLE" | "UNVERIFIED" | "REJECTED" | "IN_NEGOTIATION" | "LEASED" | "HIDDEN";
                    };
                };
                landownerMalpotUrl?: string | null | undefined;
                landleaserMalpotUrl?: string | null | undefined;
            }[];
        };
        meta: import("trpc-to-openapi").OpenApiMeta;
    }>;
    GetEscrowById: import("@trpc/server").TRPCQueryProcedure<{
        input: {
            id: string;
        };
        output: {
            id: string;
            amount: number;
            status: "HOLDING" | "RELEASED" | "REFUNDED";
            leaserId: string;
            ownerId: string;
            applicationId: string;
            application: {
                land: {
                    id: string;
                    title: string;
                    location: string;
                    heroImageUrl: string;
                };
            };
            chatChannelId?: string | null | undefined;
            landownerMalpotUrl?: string | null | undefined;
            landleaserMalpotUrl?: string | null | undefined;
        };
        meta: import("trpc-to-openapi").OpenApiMeta;
    }>;
    /**
   * SUBMIT MALPOT PAPERS
   * Targets Escrow by ID and identifies the uploader role.
   */
    SubmitMalpotPapers: import("@trpc/server").TRPCMutationProcedure<{
        input: {
            escrowId: string;
            malpotPaperUrl: string;
        };
        output: {
            success: boolean;
            message: string;
        };
        meta: import("trpc-to-openapi").OpenApiMeta;
    }>;
    GetAllEscrowsForAdmin: import("@trpc/server").TRPCQueryProcedure<{
        input: void;
        output: ({
            application: {
                land: {
                    title: string;
                    location: string;
                };
            } & {
                status: import("@prisma/client").$Enums.ApplicationStatus;
                id: string;
                chatChannelId: string | null;
                leaserId: string;
                createdAt: Date;
                leaseDurationInMonths: number;
                proposedMonthlyRent: number;
                plans: string;
                landId: string;
                additionalMessages: string | null;
            };
            leaser: {
                name: string | null;
            };
            owner: {
                name: string | null;
            };
        } & {
            applicationId: string;
            amount: number;
            paymentId: string | null;
            commission: number;
            status: import("@prisma/client").$Enums.EscrowStatus;
            id: string;
            chatChannelId: string | null;
            ownerId: string;
            leaserId: string;
            landownerMalpotUrl: string | null;
            landleaserMalpotUrl: string | null;
            createdAt: Date;
            updatedAt: Date;
        })[];
        meta: import("trpc-to-openapi").OpenApiMeta;
    }>;
    VerifyLegalDocuments: import("@trpc/server").TRPCMutationProcedure<{
        input: {
            escrowId: string;
            action: "APPROVE" | "REJECT";
        };
        output: {
            applicationId: string;
            amount: number;
            paymentId: string | null;
            commission: number;
            status: import("@prisma/client").$Enums.EscrowStatus;
            id: string;
            chatChannelId: string | null;
            ownerId: string;
            leaserId: string;
            landownerMalpotUrl: string | null;
            landleaserMalpotUrl: string | null;
            createdAt: Date;
            updatedAt: Date;
        } | [{
            applicationId: string;
            amount: number;
            paymentId: string | null;
            commission: number;
            status: import("@prisma/client").$Enums.EscrowStatus;
            id: string;
            chatChannelId: string | null;
            ownerId: string;
            leaserId: string;
            landownerMalpotUrl: string | null;
            landleaserMalpotUrl: string | null;
            createdAt: Date;
            updatedAt: Date;
        }, {
            status: import("@prisma/client").$Enums.ApplicationStatus;
            id: string;
            chatChannelId: string | null;
            leaserId: string;
            createdAt: Date;
            leaseDurationInMonths: number;
            proposedMonthlyRent: number;
            plans: string;
            landId: string;
            additionalMessages: string | null;
        }];
        meta: import("trpc-to-openapi").OpenApiMeta;
    }>;
}>>;
//# sourceMappingURL=escrow.routes.d.ts.map