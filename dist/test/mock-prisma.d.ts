import { type Mocked } from "vitest";
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
export declare const createMockPrisma: () => MockPrisma;
//# sourceMappingURL=mock-prisma.d.ts.map