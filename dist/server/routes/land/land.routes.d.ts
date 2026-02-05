export declare const landRouter: import("@trpc/server").TRPCBuiltRouter<{
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
    publish: import("@trpc/server").TRPCMutationProcedure<{
        input: {
            ownerId: string;
            location: string;
            size: {
                size: number;
                unit: "ROPANI" | "AANA" | "PAISA" | "DAAM" | "BIGHA" | "KATTHA" | "DHUR" | "SQ_FT" | "SQ_MTR";
            };
            price: number;
            description: string;
            landpic: string;
            lalpurjaUrl: string;
            morelandpic?: string[] | undefined;
            title?: string | undefined;
        };
        output: {
            id: string;
            ownerId: string;
            location: string;
            sizeInSqFt: number;
            pricePerMonth: number;
            description: string;
            heroImageUrl: string;
            galleryUrls: string[];
            status: string;
            createdAt: Date;
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
                title: string | null;
                description: string;
                location: string;
                area: string | null;
                sizeInSqFt: number;
                pricePerMonth: number;
                heroImageUrl: string;
                galleryUrls: string[];
                status: string;
                createdAt: Date;
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
            title: string | null;
            description: string;
            location: string;
            area: string | null;
            sizeInSqFt: number;
            pricePerMonth: number;
            heroImageUrl: string;
            galleryUrls: string[];
            status: string;
            createdAt: Date;
        };
        meta: import("trpc-to-openapi").OpenApiMeta;
    }>;
    updateStatus: import("@trpc/server").TRPCMutationProcedure<{
        input: {
            landId: string;
            status: "AVAILABLE" | "IN_NEGOTIATION" | "LEASED" | "HIDDEN";
        };
        output: {
            id: string;
            status: string;
        };
        meta: import("trpc-to-openapi").OpenApiMeta;
    }>;
}>>;
//# sourceMappingURL=land.routes.d.ts.map