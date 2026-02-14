// Pay Escrow Schemas
import z from "zod";
export const payEscrowInputSchema = z.object({
    applicationId: z.string(),
    amount: z.number().positive('Escrow amount must be positive'),
    paymentId: z.string(), // Reference from Khalti/eSewa
    commission: z.number().positive('Commission must be positive'),
});
export const payEscrowResponseSchema = z.object({
    success: z.boolean(),
    message: z.string(),
    escrow: z.object({
        id: z.string(),
        applicationId: z.string(),
        amount: z.number(),
        status: z.enum(['HOLDING', 'RELEASED', 'REFUNDED']),
    }),
    // ADD THE MISSING STATUSES HERE:
    landStatus: z.enum(['AVAILABLE', 'UNVERIFIED', 'REJECTED', 'IN_NEGOTIATION', 'LEASED', 'HIDDEN']),
});
// Verify Malpot Papers Schemas
export const verifyMalpotPapersInputSchema = z.object({
    applicationId: z.string(),
    malpotPaperUrl: z.string().url('Must be a valid URL'),
    adminId: z.string(), // Admin who is verifying
});
export const verifyMalpotPapersResponseSchema = z.object({
    success: z.boolean(),
    message: z.string(),
    application: z.object({
        id: z.string(),
        status: z.enum(['PENDING', 'ACCEPTED', 'REJECTED', 'COMPLETED']),
    }),
    // AND HERE:
    landStatus: z.enum(['AVAILABLE', 'UNVERIFIED', 'REJECTED', 'IN_NEGOTIATION', 'LEASED', 'HIDDEN']),
    escrowStatus: z.enum(['HOLDING', 'RELEASED', 'REFUNDED']),
});
//# sourceMappingURL=escrow.models.js.map