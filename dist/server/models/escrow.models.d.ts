import { z } from 'zod';
import type { Context } from '../context.js';
export declare const payEscrowInputSchema: z.ZodObject<{
    applicationId: z.ZodString;
    amount: z.ZodNumber;
    paymentId: z.ZodString;
    commission: z.ZodNumber;
}, z.core.$strip>;
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
    }, z.core.$strip>;
    landStatus: z.ZodEnum<{
        AVAILABLE: "AVAILABLE";
        IN_NEGOTIATION: "IN_NEGOTIATION";
        LEASED: "LEASED";
        HIDDEN: "HIDDEN";
    }>;
}, z.core.$strip>;
export declare const verifyMalpotPapersInputSchema: z.ZodObject<{
    applicationId: z.ZodString;
    malpotPaperUrl: z.ZodString;
    adminId: z.ZodString;
}, z.core.$strip>;
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
    }, z.core.$strip>;
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
}, z.core.$strip>;
export declare class EscrowModel {
    static payEscrow(ctx: Context, input: z.infer<typeof payEscrowInputSchema>): Promise<{
        success: boolean;
        message: string;
        escrow: {
            id: string;
            applicationId: string;
            amount: number;
            status: "HOLDING" | "RELEASED" | "REFUNDED";
        };
        landStatus: "AVAILABLE" | "IN_NEGOTIATION" | "LEASED" | "HIDDEN";
    }>;
    static verifyMalpotPapers(ctx: Context, input: z.infer<typeof verifyMalpotPapersInputSchema>): Promise<{
        success: boolean;
        message: string;
        application: {
            id: string;
            status: "PENDING" | "ACCEPTED" | "REJECTED" | "COMPLETED";
        };
        landStatus: "AVAILABLE" | "IN_NEGOTIATION" | "LEASED" | "HIDDEN";
        escrowStatus: "HOLDING" | "RELEASED" | "REFUNDED";
    }>;
}
//# sourceMappingURL=escrow.models.d.ts.map