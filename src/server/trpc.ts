import { TRPCError } from '@trpc/server';
import { initTRPC } from '@trpc/server';
import type { Context } from './context.js';
import type { OpenApiMeta } from 'trpc-to-openapi';

const t = initTRPC.context<Context>().meta<OpenApiMeta>().create();

export const router = t.router;
export const publicProcedure = t.procedure;

const isAdmin = t.middleware(({ ctx, next }) => {
  if (ctx.user?.role !== 'ADMIN') {
    throw new TRPCError({ code: 'FORBIDDEN', message: 'Admin access required' });
  }
  return next({ ctx });
});

export const adminProcedure = t.procedure.use(isAdmin);