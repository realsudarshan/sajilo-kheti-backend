export declare const userRouter: import("@trpc/server").TRPCBuiltRouter<{
    ctx: {};
    meta: import("trpc-to-openapi").OpenApiMeta;
    errorShape: import("@trpc/server").TRPCDefaultErrorShape;
    transformer: false;
}, import("@trpc/server").TRPCDecorateCreateRouterOptions<{
    getAllUser: import("@trpc/server").TRPCQueryProcedure<{
        input: undefined;
        output: {
            users: {
                id: number;
                name: string;
                email: string;
                adress?: string | undefined;
            }[];
        };
        meta: import("trpc-to-openapi").OpenApiMeta;
    }>;
}>>;
//# sourceMappingURL=user.routes.d.ts.map