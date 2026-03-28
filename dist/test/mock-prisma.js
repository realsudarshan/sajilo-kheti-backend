import { vi } from "vitest";
/** Minimal Prisma stub for tRPC route tests */
export const createMockPrisma = () => {
    const mock = {
        land: {
            findUnique: vi.fn(),
            update: vi.fn().mockResolvedValue({}),
        },
        application: {
            findUnique: vi.fn(),
            create: vi.fn(),
            update: vi.fn(),
            updateMany: vi.fn().mockResolvedValue({ count: 0 }),
        },
        escrow: {
            create: vi.fn(),
        },
        // Updated to match Prisma's real transaction signature (callback-based)
        $transaction: vi.fn(async (cb) => {
            if (typeof cb === 'function')
                return cb(mock);
            return Array.isArray(cb) ? Promise.all(cb) : cb;
        }),
    };
    return mock;
};
//# sourceMappingURL=mock-prisma.js.map