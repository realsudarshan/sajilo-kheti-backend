export declare const landRouter: import("@trpc/server").TRPCBuiltRouter<{
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
//# sourceMappingURL=land.routes.d.ts.map