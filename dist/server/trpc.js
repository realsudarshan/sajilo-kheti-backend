import { initTRPC } from '@trpc/server';
const t = initTRPC.context().meta().create();
export const router = t.router;
export const publicProcedure = t.procedure;
//# sourceMappingURL=trpc.js.map