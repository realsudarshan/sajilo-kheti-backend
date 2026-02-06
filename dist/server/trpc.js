import { getAuth } from '@clerk/clerk-sdk-node';
import * as trpcExpress from '@trpc/server/adapters/express';
import { prisma } from './lib/prisma.js';
export const createContext = async ({ req, res }) => {
    // 1. Verify the session with Clerk
    const { userId } = getAuth(req);
    // 2. Fetch the user's role from MongoDB
    const user = userId
        ? await prisma.user.findUnique({
            where: { clerkId: userId },
            select: { id: true, role: true }
        })
        : null;
    return { prisma, user, userId };
};
//# sourceMappingURL=trpc.js.map