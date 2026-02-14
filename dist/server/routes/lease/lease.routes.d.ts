export declare const leaseRouter: import("@trpc/server").TRPCBuiltRouter<{
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
     * STEP 1: LEASER SUBMITS APPLICATION
     * Only accessible by users with 'LEASER' role.
     */
    Submitapplication: import("@trpc/server").TRPCMutationProcedure<{
        input: {
            landId: string;
            leaseDurationInMonths: number;
            proposedMonthlyRent: number;
            plans: string;
            additionalMessages?: string | undefined;
        };
        output: {
            leaseAgreementId: string;
            leaserId: string;
            landId: string;
            leaseDurationInMonths: number;
            proposedMonthlyRent: number;
        };
        meta: import("trpc-to-openapi").OpenApiMeta;
    }>;
    /**
     * STEP 2: OWNER ACCEPTS APPLICATION
     * Only accessible by users with 'OWNER' role.
     */
    AcceptApplication: import("@trpc/server").TRPCMutationProcedure<{
        input: {
            applicationId: string;
        };
        output: {
            success: boolean;
            message: string;
            application: {
                id: string;
                status: "REJECTED" | "PENDING" | "ACCEPTED" | "COMPLETED";
                leaserId: string;
                landId: string;
            };
        };
        meta: import("trpc-to-openapi").OpenApiMeta;
    }>;
    /**
     * STEP 2b: OWNER REJECTS APPLICATION
     */
    RejectApplication: import("@trpc/server").TRPCMutationProcedure<{
        input: {
            applicationId: string;
            reason?: string | undefined;
        };
        output: {
            success: boolean;
            message: string;
            application: {
                id: string;
                status: "REJECTED" | "PENDING" | "ACCEPTED" | "COMPLETED";
            };
        };
        meta: import("trpc-to-openapi").OpenApiMeta;
    }>;
    /**
     * STEP 3: LEASER PAYS ESCROW
     * This procedure verifies the Khalti/eSewa transaction and locks the funds.
     */
    /**
     * STEP 4: ADMIN VERIFIES MALPOT PAPERS
     * Final step to release funds to owner and mark land as LEASED.
     */
    /**
     * DATA QUERIES
     */
    GetApplicationById: import("@trpc/server").TRPCQueryProcedure<{
        input: {
            applicationId: string;
        };
        output: {
            id: string;
            landId: string;
            leaserId: string;
            plans: string;
            leaseDurationInMonths: number;
            proposedMonthlyRent: number;
            status: "REJECTED" | "PENDING" | "ACCEPTED" | "COMPLETED";
            additionalMessages: string | null;
            createdAt: Date;
            land: {
                id: string;
                ownerId: string;
                title: string;
                description: string;
                location: string;
                sizeInSqmeter: number;
                pricePerMonth: number;
                heroImageUrl: string;
                galleryUrls: string[];
                lalpurjaUrl: string | null;
                status: "AVAILABLE" | "UNVERIFIED" | "REJECTED" | "IN_NEGOTIATION" | "LEASED" | "HIDDEN";
                createdAt: Date;
                updatedAt: Date;
            };
            leaser: {
                id: string;
                name: string | null;
                role: "LEASER" | "OWNER" | "ADMIN";
                isKycVerified: boolean;
                createdAt: Date;
                updatedAt: Date;
            };
        };
        meta: import("trpc-to-openapi").OpenApiMeta;
    }>;
    GetAllApplications: import("@trpc/server").TRPCQueryProcedure<{
        input: {
            status?: "REJECTED" | "PENDING" | "ACCEPTED" | "COMPLETED" | undefined;
            landId?: string | undefined;
            leaserId?: string | undefined;
        };
        output: {
            applications: {
                id: string;
                landId: string;
                leaserId: string;
                plans: string;
                leaseDurationInMonths: number;
                proposedMonthlyRent: number;
                status: "REJECTED" | "PENDING" | "ACCEPTED" | "COMPLETED";
                additionalMessages: string | null;
                createdAt: Date;
                land: {
                    id: string;
                    ownerId: string;
                    title: string;
                    description: string;
                    location: string;
                    sizeInSqmeter: number;
                    pricePerMonth: number;
                    heroImageUrl: string;
                    galleryUrls: string[];
                    lalpurjaUrl: string | null;
                    status: "AVAILABLE" | "UNVERIFIED" | "REJECTED" | "IN_NEGOTIATION" | "LEASED" | "HIDDEN";
                    createdAt: Date;
                    updatedAt: Date;
                };
                leaser: {
                    id: string;
                    name: string | null;
                    role: "LEASER" | "OWNER" | "ADMIN";
                    isKycVerified: boolean;
                    createdAt: Date;
                    updatedAt: Date;
                };
            }[];
            total: number;
        };
        meta: import("trpc-to-openapi").OpenApiMeta;
    }>;
}>>;
//# sourceMappingURL=lease.routes.d.ts.map