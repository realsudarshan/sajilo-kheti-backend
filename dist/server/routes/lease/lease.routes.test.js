import { describe, it, expect, vi, beforeEach } from "vitest";
import { TRPCError } from "@trpc/server";
import { appRouter } from "../../index.js";
import { createMockPrisma } from "../../../test/mock-prisma.js";
vi.mock("../../lib/analytics.js", () => ({
    posthog: { capture: vi.fn() },
}));
function callerCtx(prisma, user) {
    return {
        prisma: prisma,
        userId: user.id,
        user,
    };
}
describe("leaseRouter", () => {
    let prisma;
    beforeEach(() => {
        prisma = createMockPrisma();
    });
    it("Submitapplication creates application when land is AVAILABLE", async () => {
        prisma.land.findUnique.mockResolvedValue({
            id: "land1",
            status: "AVAILABLE",
            ownerId: "owner1",
        });
        prisma.application.create.mockResolvedValue({
            id: "app-new",
            leaserId: "leaser1",
            landId: "land1",
            leaseDurationInMonths: 12,
            proposedMonthlyRent: 5000,
        });
        const caller = appRouter.createCaller(callerCtx(prisma, { id: "leaser1", role: "LEASER" }));
        const out = await caller.lease.Submitapplication({
            landId: "land1",
            leaseDurationInMonths: 12,
            proposedMonthlyRent: 5000,
            plans: "Organic",
        });
        expect(out.leaseAgreementId).toBe("app-new");
        expect(out.landId).toBe("land1");
        expect(prisma.application.create).toHaveBeenCalled();
    });
    it("Submitapplication rejects when land is not AVAILABLE", async () => {
        prisma.land.findUnique.mockResolvedValue({
            id: "land1",
            status: "LEASED",
            ownerId: "owner1",
        });
        const caller = appRouter.createCaller(callerCtx(prisma, { id: "leaser1", role: "LEASER" }));
        await expect(caller.lease.Submitapplication({
            landId: "land1",
            leaseDurationInMonths: 12,
            proposedMonthlyRent: 5000,
            plans: "x",
        })).rejects.toBeInstanceOf(TRPCError);
    });
    it("AcceptApplication updates application and runs transaction", async () => {
        prisma.application.findUnique.mockResolvedValue({
            id: "app1",
            landId: "land1",
            leaserId: "leaser1",
            status: "PENDING",
            land: { id: "land1", ownerId: "owner1" },
        });
        prisma.application.update.mockResolvedValue({
            id: "app1",
            status: "ACCEPTED",
            leaserId: "leaser1",
            landId: "land1",
        });
        const caller = appRouter.createCaller(callerCtx(prisma, { id: "owner1", role: "OWNER" }));
        const out = await caller.lease.AcceptApplication({ applicationId: "app1" });
        expect(out.success).toBe(true);
        expect(out.application.status).toBe("ACCEPTED");
        expect(prisma.application.update).toHaveBeenCalled();
        expect(prisma.$transaction).toHaveBeenCalled();
    });
    it("RejectApplication sets status REJECTED", async () => {
        prisma.application.findUnique.mockResolvedValue({
            id: "app1",
            landId: "land1",
            leaserId: "leaser1",
            status: "PENDING",
            land: { id: "land1", ownerId: "owner1" },
        });
        prisma.application.update.mockResolvedValue({
            id: "app1",
            status: "REJECTED",
        });
        const caller = appRouter.createCaller(callerCtx(prisma, { id: "owner1", role: "OWNER" }));
        const out = await caller.lease.RejectApplication({ applicationId: "app1", reason: "Full" });
        expect(out.application.status).toBe("REJECTED");
    });
});
//# sourceMappingURL=lease.routes.test.js.map