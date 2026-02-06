import { TRPCError } from "@trpc/server";
import { payEscrowInputSchema, payEscrowResponseSchema } from "../../models/lease.models.js";
import { publicProcedure, router } from "../../trpc.js";
export const escrowRouter = router({
    PayEscrow: publicProcedure.meta({
        openapi: {
            method: 'POST',
            path: '/lease/pay-escrow',
            description: 'Pay escrow for an accepted application',
        },
    })
        .input(payEscrowInputSchema)
        .output(payEscrowResponseSchema)
        .mutation(async ({ ctx, input }) => {
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
    }),
});
//# sourceMappingURL=escrow.routes.js.map