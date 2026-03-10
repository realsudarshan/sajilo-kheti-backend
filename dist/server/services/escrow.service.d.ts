export declare function payEscrowService(input: {
    applicationId: string;
    amount: number;
    paymentId: string;
    commission?: number;
    userId: string;
}): Promise<{
    success: boolean;
    alreadyRecorded: boolean;
    message: string;
    escrow: {
        id: string;
        applicationId: string;
        amount: number;
        status: import("@prisma/client").$Enums.EscrowStatus;
    };
    landStatus: import("@prisma/client").$Enums.LandStatus;
}>;
//# sourceMappingURL=escrow.service.d.ts.map