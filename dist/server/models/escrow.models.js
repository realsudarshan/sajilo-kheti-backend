import { z } from "zod";
// --- ENUMS (Matches Prisma) ---
const LandStatusEnum = z.enum(['AVAILABLE', 'UNVERIFIED', 'REJECTED', 'IN_NEGOTIATION', 'LEASED', 'HIDDEN']);
const EscrowStatusEnum = z.enum(['HOLDING', 'RELEASED', 'REFUNDED']);
const ApplicationStatusEnum = z.enum(['PENDING', 'ACCEPTED', 'REJECTED', 'COMPLETED']);
// ============================================================================
// STEP 3: PAY ESCROW
// ============================================================================
export const payEscrowInputSchema = z.object({
    applicationId: z.string(),
    amount: z.number().positive('Escrow amount must be positive'),
    paymentId: z.string(), // Reference from Khalti/eSewa/Fonepay
    commission: z.number().nonnegative('Commission cannot be negative'),
});
export const payEscrowResponseSchema = z.object({
    success: z.boolean(),
    message: z.string(),
    escrow: z.object({
        id: z.string(),
        applicationId: z.string(),
        amount: z.number(),
        status: EscrowStatusEnum,
    }),
    landStatus: LandStatusEnum,
});
// ============================================================================
// STEP 4: SUBMIT MALPOT PAPERS (NEW)
// ============================================================================
const submitMalpotPapersInputSchema = z.object({
    escrowId: z.string(),
    malpotPaperUrl: z.string().url('Must be a valid URL'),
});
const submitMalpotPapersResponseSchema = z.object({
    success: z.boolean(),
    message: z.string(),
});
// ============================================================================
// STEP 5: VERIFY MALPOT PAPERS (ADMIN)
// ============================================================================
export const verifyMalpotPapersInputSchema = z.object({
    applicationId: z.string(),
    malpotPaperUrl: z.string().url('Must be a valid URL'),
    // adminId is usually taken from context (ctx.user.id), but kept if required by your logic
    adminId: z.string().optional(),
});
export const verifyMalpotPapersResponseSchema = z.object({
    success: z.boolean(),
    message: z.string(),
    application: z.object({
        id: z.string(),
        status: ApplicationStatusEnum,
    }),
    landStatus: LandStatusEnum,
    escrowStatus: EscrowStatusEnum,
});
// ============================================================================
// CHAT & UTILS
// ============================================================================
export const saveChatChannelInputSchema = z.object({
    applicationId: z.string(),
    chatChannelId: z.string(),
});
export const saveChatChannelResponseSchema = z.object({
    success: z.boolean(),
    message: z.string(),
});
// ============================================================================
// FETCH SCHEMAS
// ============================================================================
// Base Escrow Object for lists
const escrowListItemSchema = z.object({
    id: z.string(),
    applicationId: z.string(),
    ownerId: z.string(),
    leaserId: z.string(),
    amount: z.number(),
    paymentId: z.string().nullable(),
    status: EscrowStatusEnum,
    commission: z.number(),
    chatChannelId: z.string().nullable(),
    landownerMalpotUrl: z.string().nullable().optional(), // Added
    landleaserMalpotUrl: z.string().nullable().optional(), // Added
    createdAt: z.date(),
    updatedAt: z.date(),
    application: z.object({
        id: z.string(),
        status: ApplicationStatusEnum,
        leaseDurationInMonths: z.number(),
        proposedMonthlyRent: z.number(),
        plans: z.string(),
        land: z.object({
            id: z.string(),
            title: z.string(),
            location: z.string(),
            heroImageUrl: z.string(),
            status: LandStatusEnum,
        }),
    }),
});
export const getMyEscrowsResponseSchema = z.object({
    escrows: z.array(escrowListItemSchema),
});
export const getMyOwnerEscrowsResponseSchema = getMyEscrowsResponseSchema;
// Detailed view for the Verification Page
export const getEscrowByIdResponseSchema = z.object({
    id: z.string(),
    amount: z.number(),
    status: EscrowStatusEnum,
    leaserId: z.string(),
    ownerId: z.string(),
    applicationId: z.string(),
    chatChannelId: z.string().nullable().optional(),
    landownerMalpotUrl: z.string().nullable().optional(), // Crucial for UI cards
    landleaserMalpotUrl: z.string().nullable().optional(), // Crucial for UI cards
    application: z.object({
        land: z.object({
            id: z.string(),
            title: z.string(),
            location: z.string(),
            heroImageUrl: z.string(),
        }),
    }),
});
//# sourceMappingURL=escrow.models.js.map