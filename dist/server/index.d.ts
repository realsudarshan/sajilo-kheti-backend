export declare const appRouter: import("@trpc/server").TRPCBuiltRouter<{
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
    user: import("@trpc/server").TRPCBuiltRouter<{
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
        getAllUser: import("@trpc/server").TRPCQueryProcedure<{
            input: void;
            output: {
                users: {
                    id: string;
                    role: "LEASER" | "OWNER" | "ADMIN";
                    isKycVerified: boolean;
                    createdAt: Date;
                    email: string;
                    name: string;
                    imageUrl?: string | undefined;
                }[];
            };
            meta: import("trpc-to-openapi").OpenApiMeta;
        }>;
        createUser: import("@trpc/server").TRPCMutationProcedure<{
            input: {
                id: string;
            };
            output: {
                id: string;
                role: "LEASER" | "OWNER" | "ADMIN";
                isKycVerified: boolean;
                createdAt: Date;
            };
            meta: import("trpc-to-openapi").OpenApiMeta;
        }>;
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
        updateKycStatus: import("@trpc/server").TRPCMutationProcedure<{
            input: {
                userId: string;
                status: "REJECTED" | "PENDING" | "APPROVED";
            };
            output: {
                userId: string;
                kycStatus: string;
                userRole: "LEASER" | "OWNER" | "ADMIN";
                isKycVerified: boolean;
            };
            meta: import("trpc-to-openapi").OpenApiMeta;
        }>;
        getKycDetails: import("@trpc/server").TRPCQueryProcedure<{
            input: void;
            output: {
                userId: string;
                id: string;
                status: string;
                citizenshipNumber: string;
                documentUrl: string;
                selfieUrl: string | null;
            } | null;
            meta: import("trpc-to-openapi").OpenApiMeta;
        }>;
        getAllKycDetails: import("@trpc/server").TRPCQueryProcedure<{
            input: void;
            output: {
                kycDetails: {
                    userName: string;
                    userEmail: string;
                    user: {
                        id: string;
                        role: import("@prisma/client").$Enums.UserRole;
                        isKycVerified: boolean;
                    };
                    userId: string;
                    id: string;
                    status: string;
                    citizenshipNumber: string;
                    documentUrl: string;
                    selfieUrl: string | null;
                }[];
            };
            meta: import("trpc-to-openapi").OpenApiMeta;
        }>;
    }>>;
    land: import("@trpc/server").TRPCBuiltRouter<{
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
        publish: import("@trpc/server").TRPCMutationProcedure<{
            input: {
                ownerId: string;
                title: string;
                location: string;
                size: {
                    system: "HILLY";
                    ropani?: number | undefined;
                    aana?: number | undefined;
                    paisa?: number | undefined;
                    daam?: number | undefined;
                } | {
                    system: "TERAI";
                    bigha?: number | undefined;
                    kattha?: number | undefined;
                    dhur?: number | undefined;
                } | {
                    system: "FLAT";
                    value: number;
                    unit: "SQ_FT" | "SQ_MTR";
                };
                price: number;
                description: string;
                landpic: string;
                morelandpic?: string[] | undefined;
                lalpurjaUrl?: string | undefined;
            };
            output: {
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
            meta: import("trpc-to-openapi").OpenApiMeta;
        }>;
        acceptLand: import("@trpc/server").TRPCMutationProcedure<{
            input: {
                landId: string;
            };
            output: {
                id: string;
                createdAt: Date;
                updatedAt: Date;
                ownerId: string;
                title: string;
                location: string;
                description: string;
                lalpurjaUrl: string | null;
                status: import("@prisma/client").$Enums.LandStatus;
                sizeInSqmeter: number;
                pricePerMonth: number;
                heroImageUrl: string;
                galleryUrls: string[];
            };
            meta: import("trpc-to-openapi").OpenApiMeta;
        }>;
        rejectLand: import("@trpc/server").TRPCMutationProcedure<{
            input: {
                landId: string;
            };
            output: {
                id: string;
                createdAt: Date;
                updatedAt: Date;
                ownerId: string;
                title: string;
                location: string;
                description: string;
                lalpurjaUrl: string | null;
                status: import("@prisma/client").$Enums.LandStatus;
                sizeInSqmeter: number;
                pricePerMonth: number;
                heroImageUrl: string;
                galleryUrls: string[];
            };
            meta: import("trpc-to-openapi").OpenApiMeta;
        }>;
        search: import("@trpc/server").TRPCQueryProcedure<{
            input: {
                location?: string | undefined;
                minPrice?: number | undefined;
                maxPrice?: number | undefined;
                minSize?: number | undefined;
                maxSize?: number | undefined;
            };
            output: {
                lands: {
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
                }[];
            };
            meta: import("trpc-to-openapi").OpenApiMeta;
        }>;
        getById: import("@trpc/server").TRPCQueryProcedure<{
            input: {
                landId: string;
            };
            output: {
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
            meta: import("trpc-to-openapi").OpenApiMeta;
        }>;
        updateStatus: import("@trpc/server").TRPCMutationProcedure<{
            input: {
                landId: string;
                status: "AVAILABLE" | "UNVERIFIED" | "REJECTED" | "IN_NEGOTIATION" | "LEASED" | "HIDDEN";
            };
            output: {
                id: string;
                status: "AVAILABLE" | "UNVERIFIED" | "REJECTED" | "IN_NEGOTIATION" | "LEASED" | "HIDDEN";
            };
            meta: import("trpc-to-openapi").OpenApiMeta;
        }>;
        getAllLandsAdmin: import("@trpc/server").TRPCQueryProcedure<{
            input: {
                status?: "AVAILABLE" | "UNVERIFIED" | "REJECTED" | "IN_NEGOTIATION" | "LEASED" | "HIDDEN" | undefined;
            } | undefined;
            output: ({
                owner: {
                    id: string;
                    name: string | null;
                };
            } & {
                id: string;
                createdAt: Date;
                updatedAt: Date;
                ownerId: string;
                title: string;
                location: string;
                description: string;
                lalpurjaUrl: string | null;
                status: import("@prisma/client").$Enums.LandStatus;
                sizeInSqmeter: number;
                pricePerMonth: number;
                heroImageUrl: string;
                galleryUrls: string[];
            })[];
            meta: import("trpc-to-openapi").OpenApiMeta;
        }>;
    }>>;
    lease: import("@trpc/server").TRPCBuiltRouter<{
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
    escrow: import("@trpc/server").TRPCBuiltRouter<{
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
                landStatus: "AVAILABLE" | "UNVERIFIED" | "REJECTED" | "IN_NEGOTIATION" | "LEASED" | "HIDDEN";
            };
            meta: import("trpc-to-openapi").OpenApiMeta;
        }>;
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
                    status: "REJECTED" | "PENDING" | "ACCEPTED" | "COMPLETED";
                };
                landStatus: "AVAILABLE" | "UNVERIFIED" | "REJECTED" | "IN_NEGOTIATION" | "LEASED" | "HIDDEN";
                escrowStatus: "HOLDING" | "RELEASED" | "REFUNDED";
            };
            meta: import("trpc-to-openapi").OpenApiMeta;
        }>;
    }>>;
}>>;
export type AppRouter = typeof appRouter;
//# sourceMappingURL=index.d.ts.map