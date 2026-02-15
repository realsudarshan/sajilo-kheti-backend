import type { Prisma } from '@prisma/client';
export declare const userRouter: import("@trpc/server").TRPCBuiltRouter<{
    ctx: {
        prisma: import("@prisma/client").PrismaClient<Prisma.PrismaClientOptions, never, import("@prisma/client/runtime/library").DefaultArgs>;
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
            id: string;
            status: string;
            userId: string;
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
                id: string;
                status: string;
                userId: string;
                citizenshipNumber: string;
                documentUrl: string;
                selfieUrl: string | null;
            }[];
        };
        meta: import("trpc-to-openapi").OpenApiMeta;
    }>;
    getMe: import("@trpc/server").TRPCQueryProcedure<{
        input: void;
        output: {
            kycDetails: {
                id: string;
                status: string;
                userId: string;
                citizenshipNumber: string;
                documentUrl: string;
                selfieUrl: string | null;
            } | null;
            lands: {
                id: string;
                status: import("@prisma/client").$Enums.LandStatus;
                createdAt: Date;
                updatedAt: Date;
                description: string;
                ownerId: string;
                title: string;
                location: string;
                sizeInSqmeter: number;
                pricePerMonth: number;
                heroImageUrl: string;
                galleryUrls: string[];
                lalpurjaUrl: string | null;
            }[];
            applications: {
                id: string;
                status: import("@prisma/client").$Enums.ApplicationStatus;
                createdAt: Date;
                landId: string;
                leaserId: string;
                plans: string;
                leaseDurationInMonths: number;
                proposedMonthlyRent: number;
                chatChannelId: string | null;
                additionalMessages: string | null;
            }[];
        } & {
            id: string;
            name: string | null;
            role: import("@prisma/client").$Enums.UserRole;
            isKycVerified: boolean;
            createdAt: Date;
            updatedAt: Date;
        };
        meta: import("trpc-to-openapi").OpenApiMeta;
    }>;
}>>;
//# sourceMappingURL=user.routes.d.ts.map