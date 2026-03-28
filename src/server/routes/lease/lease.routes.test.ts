import { describe, it, expect, vi, beforeEach } from "vitest";
import { TRPCError } from "@trpc/server";
import { appRouter } from "../../index.js";
import type { Context } from "../../context.js";
import { createMockPrisma, type MockPrisma } from "../../../test/mock-prisma.js";

vi.mock("../../lib/analytics.js", () => ({
  posthog: { capture: vi.fn() },
}));

function callerCtx(prisma: MockPrisma, user: { id: string; role: "LEASER" | "OWNER" | "ADMIN" }): Context {
  return {
    prisma: prisma as unknown as Context["prisma"],
    userId: user.id,
    user,
  };
}

describe("leaseRouter", () => {
  let prisma: MockPrisma;

  beforeEach(() => {
    prisma = createMockPrisma();
  });

  it("Submitapplication creates application when land is AVAILABLE", async () => {
    prisma.land.findUnique.mockResolvedValue({
      id: "land1",
      status: "AVAILABLE",
      ownerId: "owner1",
    } as never);
    prisma.application.create.mockResolvedValue({
      id: "app-new",
      leaserId: "leaser1",
      landId: "land1",
      leaseDurationInMonths: 12,
      proposedMonthlyRent: 5000,
    } as never);

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
    } as never);

    const caller = appRouter.createCaller(callerCtx(prisma, { id: "leaser1", role: "LEASER" }));
    await expect(
      caller.lease.Submitapplication({
        landId: "land1",
        leaseDurationInMonths: 12,
        proposedMonthlyRent: 5000,
        plans: "x",
      })
    ).rejects.toBeInstanceOf(TRPCError);
  });

  it("AcceptApplication updates application and runs transaction", async () => {
    prisma.application.findUnique.mockResolvedValue({
      id: "app1",
      landId: "land1",
      leaserId: "leaser1",
      status: "PENDING",
      land: { id: "land1", ownerId: "owner1" },
    } as never);
    prisma.application.update.mockResolvedValue({
      id: "app1",
      status: "ACCEPTED",
      leaserId: "leaser1",
      landId: "land1",
    } as never);

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
    } as never);
    prisma.application.update.mockResolvedValue({
      id: "app1",
      status: "REJECTED",
    } as never);

    const caller = appRouter.createCaller(callerCtx(prisma, { id: "owner1", role: "OWNER" }));
    const out = await caller.lease.RejectApplication({ applicationId: "app1", reason: "Full" });

    expect(out.application.status).toBe("REJECTED");
  });
});
