import { describe, it, expect, vi, beforeEach } from "vitest";

vi.mock("../lib/analytics.js", () => ({
  posthog: { capture: vi.fn() },
}));

const mockFindUnique = vi.fn();
const mockEscrowCreate = vi.fn();

vi.mock("../lib/prisma.js", () => ({
  prisma: {
    application: {
      findUnique: (...args: unknown[]) => mockFindUnique(...args),
    },
    escrow: {
      create: (...args: unknown[]) => mockEscrowCreate(...args),
    },
  },
}));

import { payEscrowService } from "./escrow.service.js";

describe("payEscrowService", () => {
  beforeEach(() => {
    mockFindUnique.mockReset();
    mockEscrowCreate.mockReset();
  });

  it("throws when application is not ACCEPTED", async () => {
    mockFindUnique.mockResolvedValue({
      id: "a1",
      leaserId: "l1",
      status: "PENDING",
      land: { status: "AVAILABLE", ownerId: "o1" },
      escrow: null,
    });

    await expect(
      payEscrowService({
        applicationId: "a1",
        amount: 1000,
        paymentId: "p1",
        userId: "l1",
      })
    ).rejects.toMatchObject({ code: "BAD_REQUEST" });
  });

  it("returns existing escrow when already paid (idempotent)", async () => {
    mockFindUnique.mockResolvedValue({
      id: "a1",
      leaserId: "l1",
      status: "ACCEPTED",
      land: { status: "IN_NEGOTIATION", ownerId: "o1" },
      escrow: {
        id: "e1",
        applicationId: "a1",
        amount: 1000,
        status: "HOLDING",
      },
    });

    const out = await payEscrowService({
      applicationId: "a1",
      amount: 1000,
      paymentId: "p1",
      userId: "l1",
    });

    expect(out.alreadyRecorded).toBe(true);
    expect(out.escrow?.status).toBe("HOLDING");
    expect(mockEscrowCreate).not.toHaveBeenCalled();
  });

  it("creates HOLDING escrow when valid", async () => {
    mockFindUnique.mockResolvedValue({
      id: "a1",
      leaserId: "l1",
      landId: "land1",
      status: "ACCEPTED",
      land: { status: "IN_NEGOTIATION", ownerId: "o1" },
      escrow: null,
    });
    mockEscrowCreate.mockResolvedValue({
      id: "e-new",
      applicationId: "a1",
      amount: 2000,
      status: "HOLDING",
    });

    const out = await payEscrowService({
      applicationId: "a1",
      amount: 2000,
      paymentId: "pay-x",
      userId: "l1",
    });

    expect(out.alreadyRecorded).toBe(false);
    expect(out.escrow?.status).toBe("HOLDING");
    expect(mockEscrowCreate).toHaveBeenCalled();
  });
});
