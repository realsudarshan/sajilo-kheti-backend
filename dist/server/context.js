import * as trpcExpress from '@trpc/server/adapters/express';
import { prisma } from './lib/prisma.js';
export const createContext = async ({ req, res, }) => {
    const userId = req.headers['x-user-id'];
    const user = userId
        ? await prisma.user.findUnique({ where: { id: userId }, select: { id: true, role: true } })
        : null;
    return { prisma, user };
};
//# sourceMappingURL=context.js.map