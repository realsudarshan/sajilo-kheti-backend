
import * as trpcExpress from '@trpc/server/adapters/express';
import { prisma } from './lib/prisma.js';
import { getAuth } from '@clerk/express';

export const createContext = async ({ req, res }: trpcExpress.CreateExpressContextOptions) => {
  // 1. Verify the session with Clerk
  const { userId } = getAuth(req);
  const auth = getAuth(req)
 console.log('🔍 tRPC Auth Debug:', {
  userIdfromGetAuth: userId,
    userId: auth.userId,
    sessionId: auth.sessionId,
    hasAuthHeader: !!req.headers.authorization,
    hasCookie: !!req.headers.cookie,
    cookiePreview: req.headers.cookie?.substring(0, 100), // First 100 chars
  });
  // 2. Fetch the user's role from MongoDB
  const user = userId 
    ? await prisma.user.findUnique({ 
        where: { id: userId },
        select: { id: true, role: true } 
      }) 
    : null;
    console.log('THe user from DB', user);

  return { prisma, user, userId };
};

export type Context = Awaited<ReturnType<typeof createContext>>;