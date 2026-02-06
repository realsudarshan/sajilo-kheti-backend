import * as trpcExpress from '@trpc/server/adapters/express';
import { prisma } from './lib/prisma.js';
import { getAuth } from '@clerk/express';
export const createContext = async ({ req, res }) => {
    // 1. Verify the session with Clerk
    const { userId } = getAuth(req);
    // 2. Fetch the user's role from MongoDB
    const user = userId
        ? await prisma.user.findUnique({
            where: { id: userId },
            select: { id: true, role: true }
        })
        : null;
    return { prisma, user, userId };
};
//# sourceMappingURL=context.js.map