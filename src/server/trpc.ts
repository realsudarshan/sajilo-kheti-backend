import { initTRPC, TRPCError } from '@trpc/server';
import type { Context } from './context.js';
import { z } from 'zod';

import type { OpenApiMeta } from 'trpc-to-openapi';

const t = initTRPC.context<Context>().meta<OpenApiMeta>().create();

export const router = t.router;
export const publicProcedure = t.procedure;






// 1. The PROTECTED procedure that "fixes" the null error
const isAuthed = t.middleware(({ ctx, next }) => {
  // Check if they exist
  if (!ctx.userId || !ctx.user) {
    throw new TRPCError({ code: 'UNAUTHORIZED' });
  }

  // CRITICAL: We pass back the checked values. 
  // This "narrows" the type from User | null to just User.
  return next({
    ctx: {
      userId: ctx.userId,
      user: ctx.user, // TypeScript now knows this is definitely not null
    },
  });
});

export const protectedProcedure = t.procedure.use(isAuthed);

// 2. The Role-Based procedures now work perfectly
export const adminProcedure = protectedProcedure.use(({ ctx, next }) => {
  if (ctx.user.role !== 'ADMIN') {
    throw new TRPCError({ code: 'FORBIDDEN', message: 'Admin access required' });
  }
  return next({ ctx });
});

export const ownerProcedure = protectedProcedure.use(({ ctx, next }) => {
  if (ctx.user.role !== 'OWNER') {
    throw new TRPCError({ code: 'FORBIDDEN', message: 'Land Owner access required' });
  }
  return next({ ctx });
});

export const leaserProcedure = protectedProcedure.use(({ ctx, next }) => {
  if (ctx.user.role !== 'LEASER') {
    throw new TRPCError({ code: 'FORBIDDEN', message: 'Land Leaser access required' });
  }
  return next({ ctx });
});