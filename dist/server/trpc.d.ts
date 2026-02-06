import type { OpenApiMeta } from 'trpc-to-openapi';
export declare const router: import("@trpc/server").TRPCRouterBuilder<{
    ctx: {
        prisma: import("@prisma/client").PrismaClient<import("@prisma/client").Prisma.PrismaClientOptions, never, import("@prisma/client/runtime/library").DefaultArgs>;
        user: {
            id: string;
            role: import("@prisma/client").$Enums.UserRole;
        } | null;
        userId: string | null;
    };
    meta: OpenApiMeta;
    errorShape: import("@trpc/server").TRPCDefaultErrorShape;
    transformer: false;
}>;
export declare const publicProcedure: import("@trpc/server").TRPCProcedureBuilder<{
    prisma: import("@prisma/client").PrismaClient<import("@prisma/client").Prisma.PrismaClientOptions, never, import("@prisma/client/runtime/library").DefaultArgs>;
    user: {
        id: string;
        role: import("@prisma/client").$Enums.UserRole;
    } | null;
    userId: string | null;
}, OpenApiMeta, object, import("@trpc/server").TRPCUnsetMarker, import("@trpc/server").TRPCUnsetMarker, import("@trpc/server").TRPCUnsetMarker, import("@trpc/server").TRPCUnsetMarker, false>;
export declare const protectedProcedure: import("@trpc/server").TRPCProcedureBuilder<{
    prisma: import("@prisma/client").PrismaClient<import("@prisma/client").Prisma.PrismaClientOptions, never, import("@prisma/client/runtime/library").DefaultArgs>;
    user: {
        id: string;
        role: import("@prisma/client").$Enums.UserRole;
    } | null;
    userId: string | null;
}, OpenApiMeta, {
    userId: string;
    user: {
        id: string;
        role: import("@prisma/client").$Enums.UserRole;
    };
}, import("@trpc/server").TRPCUnsetMarker, import("@trpc/server").TRPCUnsetMarker, import("@trpc/server").TRPCUnsetMarker, import("@trpc/server").TRPCUnsetMarker, false>;
export declare const adminProcedure: import("@trpc/server").TRPCProcedureBuilder<{
    prisma: import("@prisma/client").PrismaClient<import("@prisma/client").Prisma.PrismaClientOptions, never, import("@prisma/client/runtime/library").DefaultArgs>;
    user: {
        id: string;
        role: import("@prisma/client").$Enums.UserRole;
    } | null;
    userId: string | null;
}, OpenApiMeta, {
    userId: string;
    user: {
        id: string;
        role: import("@prisma/client").$Enums.UserRole;
    };
    prisma: import("@prisma/client").PrismaClient<import("@prisma/client").Prisma.PrismaClientOptions, never, import("@prisma/client/runtime/library").DefaultArgs>;
}, import("@trpc/server").TRPCUnsetMarker, import("@trpc/server").TRPCUnsetMarker, import("@trpc/server").TRPCUnsetMarker, import("@trpc/server").TRPCUnsetMarker, false>;
export declare const ownerProcedure: import("@trpc/server").TRPCProcedureBuilder<{
    prisma: import("@prisma/client").PrismaClient<import("@prisma/client").Prisma.PrismaClientOptions, never, import("@prisma/client/runtime/library").DefaultArgs>;
    user: {
        id: string;
        role: import("@prisma/client").$Enums.UserRole;
    } | null;
    userId: string | null;
}, OpenApiMeta, {
    userId: string;
    user: {
        id: string;
        role: import("@prisma/client").$Enums.UserRole;
    };
    prisma: import("@prisma/client").PrismaClient<import("@prisma/client").Prisma.PrismaClientOptions, never, import("@prisma/client/runtime/library").DefaultArgs>;
}, import("@trpc/server").TRPCUnsetMarker, import("@trpc/server").TRPCUnsetMarker, import("@trpc/server").TRPCUnsetMarker, import("@trpc/server").TRPCUnsetMarker, false>;
export declare const leaserProcedure: import("@trpc/server").TRPCProcedureBuilder<{
    prisma: import("@prisma/client").PrismaClient<import("@prisma/client").Prisma.PrismaClientOptions, never, import("@prisma/client/runtime/library").DefaultArgs>;
    user: {
        id: string;
        role: import("@prisma/client").$Enums.UserRole;
    } | null;
    userId: string | null;
}, OpenApiMeta, {
    userId: string;
    user: {
        id: string;
        role: import("@prisma/client").$Enums.UserRole;
    };
    prisma: import("@prisma/client").PrismaClient<import("@prisma/client").Prisma.PrismaClientOptions, never, import("@prisma/client/runtime/library").DefaultArgs>;
}, import("@trpc/server").TRPCUnsetMarker, import("@trpc/server").TRPCUnsetMarker, import("@trpc/server").TRPCUnsetMarker, import("@trpc/server").TRPCUnsetMarker, false>;
//# sourceMappingURL=trpc.d.ts.map