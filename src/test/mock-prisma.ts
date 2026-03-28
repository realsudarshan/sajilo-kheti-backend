import { vi, type Mocked } from "vitest";
import type { PrismaClient } from "@prisma/client";

/** * 1. Define an explicit type for your mock. 
 * This prevents the "not portable" error because it uses 
 * types known to your project (@prisma/client).
 */
export type MockPrisma = {
  land: {
    findUnique: any;
    update: any;
  };
  application: {
    findUnique: any;
    create: any;
    update: any;
    updateMany: any;
  };
  escrow: {
    create: any;
  };
  $transaction: any;
} & Mocked<PrismaClient>;

/** Minimal Prisma stub for tRPC route tests */
export const createMockPrisma = (): MockPrisma => {
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
    $transaction: vi.fn(async (cb: (tx: any) => Promise<unknown>) => {
        if (typeof cb === 'function') return cb(mock);
        return Array.isArray(cb) ? Promise.all(cb) : cb;
    }),
  };

  return mock as unknown as MockPrisma;
}