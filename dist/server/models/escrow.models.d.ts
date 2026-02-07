import z from "zod";
export declare const payEscrowInputSchema: z.ZodObject<{
    applicationId: z.ZodString;
    amount: z.ZodNumber;
    paymentId: z.ZodString;
    commission: z.ZodNumber;
}, z.z.core.$strip>;
export declare const payEscrowResponseSchema: z.ZodObject<{
    success: z.ZodBoolean;
    message: z.ZodString;
    escrow: z.ZodObject<{
        id: z.ZodString;
        applicationId: z.ZodString;
        amount: z.ZodNumber;
        status: z.ZodEnum<{
            HOLDING: "HOLDING";
            RELEASED: "RELEASED";
            REFUNDED: "REFUNDED";
        }>;
    }, z.z.core.$strip>;
    landStatus: z.ZodEnum<{
        AVAILABLE: "AVAILABLE";
        IN_NEGOTIATION: "IN_NEGOTIATION";
        LEASED: "LEASED";
        HIDDEN: "HIDDEN";
    }>;
}, z.z.core.$strip>;
export declare const verifyMalpotPapersInputSchema: z.ZodObject<{
    applicationId: z.ZodString;
    malpotPaperUrl: z.ZodString;
    adminId: z.ZodString;
}, z.z.core.$strip>;
export declare const verifyMalpotPapersResponseSchema: z.ZodObject<{
    success: z.ZodBoolean;
    message: z.ZodString;
    application: z.ZodObject<{
        id: z.ZodString;
        status: z.ZodEnum<{
            PENDING: "PENDING";
            ACCEPTED: "ACCEPTED";
            REJECTED: "REJECTED";
            COMPLETED: "COMPLETED";
        }>;
    }, z.z.core.$strip>;
    landStatus: z.ZodEnum<{
        AVAILABLE: "AVAILABLE";
        IN_NEGOTIATION: "IN_NEGOTIATION";
        LEASED: "LEASED";
        HIDDEN: "HIDDEN";
    }>;
    escrowStatus: z.ZodEnum<{
        HOLDING: "HOLDING";
        RELEASED: "RELEASED";
        REFUNDED: "REFUNDED";
    }>;
}, z.z.core.$strip>;
//# sourceMappingURL=escrow.models.d.ts.map