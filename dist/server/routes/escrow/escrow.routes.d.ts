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
            landStatus: "REJECTED" | "UNVERIFIED" | "AVAILABLE" | "IN_NEGOTIATION" | "LEASED" | "HIDDEN";
        };
        meta: import("trpc-to-openapi").OpenApiMeta;
    }>;
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
                status: "PENDING" | "ACCEPTED" | "REJECTED" | "COMPLETED";
            };
            landStatus: "REJECTED" | "UNVERIFIED" | "AVAILABLE" | "IN_NEGOTIATION" | "LEASED" | "HIDDEN";
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
                    status: "PENDING" | "ACCEPTED" | "REJECTED" | "COMPLETED";
                    leaseDurationInMonths: number;
                    proposedMonthlyRent: number;
                    plans: string;
                    land: {
                        id: string;
                        title: string;
                        location: string;
                        heroImageUrl: string;
                        status: "REJECTED" | "UNVERIFIED" | "AVAILABLE" | "IN_NEGOTIATION" | "LEASED" | "HIDDEN";
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
                    status: "PENDING" | "ACCEPTED" | "REJECTED" | "COMPLETED";
                    leaseDurationInMonths: number;
                    proposedMonthlyRent: number;
                    plans: string;
                    land: {
                        id: string;
                        title: string;
                        location: string;
                        heroImageUrl: string;
                        status: "REJECTED" | "UNVERIFIED" | "AVAILABLE" | "IN_NEGOTIATION" | "LEASED" | "HIDDEN";
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
            leaser: {
                name: string | null;
            };
            application: {
                land: {
                    title: string;
                    location: string;
                };
            } & {
                id: string;
                createdAt: Date;
                landId: string;
                leaserId: string;
                plans: string;
                leaseDurationInMonths: number;
                proposedMonthlyRent: number;
                status: import("@prisma/client").$Enums.ApplicationStatus;
                chatChannelId: string | null;
                additionalMessages: string | null;
            };
            owner: {
                name: string | null;
            };
        } & {
            id: string;
            createdAt: Date;
            updatedAt: Date;
            leaserId: string;
            status: import("@prisma/client").$Enums.EscrowStatus;
            chatChannelId: string | null;
            applicationId: string;
            ownerId: string;
            amount: number;
            paymentId: string | null;
            commission: number;
            landownerMalpotUrl: string | null;
            landleaserMalpotUrl: string | null;
        })[];
        meta: import("trpc-to-openapi").OpenApiMeta;
    }>;
    VerifyLegalDocuments: import("@trpc/server").TRPCMutationProcedure<{
        input: {
            escrowId: string;
            action: "APPROVE" | "REJECT";
        };
        output: {
            id: string;
            createdAt: Date;
            updatedAt: Date;
            leaserId: string;
            status: import("@prisma/client").$Enums.EscrowStatus;
            chatChannelId: string | null;
            applicationId: string;
            ownerId: string;
            amount: number;
            paymentId: string | null;
            commission: number;
            landownerMalpotUrl: string | null;
            landleaserMalpotUrl: string | null;
        } | [{
            id: string;
            createdAt: Date;
            updatedAt: Date;
            leaserId: string;
            status: import("@prisma/client").$Enums.EscrowStatus;
            chatChannelId: string | null;
            applicationId: string;
            ownerId: string;
            amount: number;
            paymentId: string | null;
            commission: number;
            landownerMalpotUrl: string | null;
            landleaserMalpotUrl: string | null;
        }, {
            id: string;
            createdAt: Date;
            landId: string;
            leaserId: string;
            plans: string;
            leaseDurationInMonths: number;
            proposedMonthlyRent: number;
            status: import("@prisma/client").$Enums.ApplicationStatus;
            chatChannelId: string | null;
            additionalMessages: string | null;
        }, {
            id: string;
            createdAt: Date;
            updatedAt: Date;
            description: string;
            status: import("@prisma/client").$Enums.LandStatus;
            ownerId: string;
            title: string;
            location: string;
            latitude: number;
            longitude: number;
            sizeInSqmeter: number;
            pricePerMonth: number;
            heroImageUrl: string;
            galleryUrls: string[];
            lalpurjaUrl: string;
        }];
        meta: import("trpc-to-openapi").OpenApiMeta;
    }>;
    GetAllEscrowsAgreementForAdmin: import("@trpc/server").TRPCQueryProcedure<{
        input: void;
        output: any;
        meta: import("trpc-to-openapi").OpenApiMeta;
    }>;
}>>;
//# sourceMappingURL=escrow.routes.d.ts.map