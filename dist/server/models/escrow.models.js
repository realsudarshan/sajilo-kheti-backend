import { TRPCError } from '@trpc/server';
import { z } from 'zod';
// Pay Escrow Schemas
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
    landStatus: z.enum(['AVAILABLE', 'IN_NEGOTIATION', 'LEASED', 'HIDDEN']),
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
    landStatus: z.enum(['AVAILABLE', 'IN_NEGOTIATION', 'LEASED', 'HIDDEN']),
    escrowStatus: z.enum(['HOLDING', 'RELEASED', 'REFUNDED']),
});
export class EscrowModel {
    static async payEscrow(ctx, input) {
        // Find the application
        const application = await ctx.prisma.application.findUnique({
            where: { id: input.applicationId },
            include: {
                land: true,
                escrow: true,
            },
        });
        if (!application) {
            throw new TRPCError({
                code: 'NOT_FOUND',
                message: 'Application not found'
            });
        }
        if (application.status !== 'ACCEPTED') {
            throw new TRPCError({
                code: 'BAD_REQUEST',
                message: 'Application must be ACCEPTED before paying escrow'
            });
        }
        if (application.escrow) {
            throw new TRPCError({
                code: 'BAD_REQUEST',
                message: 'Escrow payment already exists for this application'
            });
        }
        // Verify land is already in IN_NEGOTIATION status (from acceptance)
        if (application.land.status !== 'IN_NEGOTIATION') {
            throw new TRPCError({
                code: 'BAD_REQUEST',
                message: 'Land must be in IN_NEGOTIATION status. Application must be accepted first.'
            });
        }
        // Create escrow record
        const escrow = await ctx.prisma.escrow.create({
            data: {
                applicationId: input.applicationId,
                amount: input.amount,
                paymentId: input.paymentId,
                commission: input.commission,
                status: 'HOLDING',
            },
        });
        // Land status remains IN_NEGOTIATION (already set during acceptance)
        return {
            success: true,
            message: 'Escrow payment successful. You can now chat and arrange to meet at Malpot Karyalaya.',
            escrow: {
                id: escrow.id,
                applicationId: escrow.applicationId,
                amount: escrow.amount,
                status: escrow.status,
            },
            landStatus: application.land.status,
        };
    }
    static async verifyMalpotPapers(ctx, input) {
        const application = await ctx.prisma.application.findUnique({
            where: { id: input.applicationId },
            include: { land: true, escrow: true },
        });
        if (!application || !application.escrow) {
            throw new TRPCError({ code: 'BAD_REQUEST', message: 'Missing application or escrow payment' });
        }
        const results = await ctx.prisma.$transaction([
            ctx.prisma.leaseAgreement.upsert({
                where: { applicationId: input.applicationId },
                create: { applicationId: input.applicationId, malpotPaperUrl: input.malpotPaperUrl, adminVerified: true, verifiedAt: new Date() },
                update: { malpotPaperUrl: input.malpotPaperUrl, adminVerified: true, verifiedAt: new Date() },
            }),
            ctx.prisma.application.update({ where: { id: input.applicationId }, data: { status: 'COMPLETED' } }),
            ctx.prisma.land.update({ where: { id: application.landId }, data: { status: 'LEASED' } }),
            ctx.prisma.escrow.update({ where: { id: application.escrow.id }, data: { status: 'RELEASED' } }),
        ]);
        return {
            success: true,
            message: 'Malpot papers verified. Funds released to owner.',
            application: { id: results[1].id, status: results[1].status },
            landStatus: results[2].status,
            escrowStatus: results[3].status,
        };
    }
}
//# sourceMappingURL=escrow.models.js.map