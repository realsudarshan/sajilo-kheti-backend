import { TRPCError } from '@trpc/server';
import { initTRPC } from '@trpc/server';
const t = initTRPC.context().meta().create();
export const router = t.router;
export const publicProcedure = t.procedure;
const isAdmin = t.middleware(({ ctx, next }) => {
    if (ctx.user?.role !== 'ADMIN') {
        throw new TRPCError({ code: 'FORBIDDEN', message: 'Admin access required' });
    }
    return next({ ctx });
});
export const adminProcedure = t.procedure.use(isAdmin);
//# sourceMappingURL=trpc.js.map