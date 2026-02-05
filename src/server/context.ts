import * as trpcExpress from '@trpc/server/adapters/express';
import { prisma } from './lib/prisma.js';

export const createContext = async ({
  req,
  res,
}: trpcExpress.CreateExpressContextOptions) => {
  const userId = req.headers['x-user-id'] as string | undefined;
  const user = userId
    ? await prisma.user.findUnique({ where: { id: userId }, select: { id: true, role: true } })
    : null;
  return { prisma, user };
};
export type Context = Awaited<ReturnType<typeof createContext>>;