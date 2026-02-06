import { TRPCError } from '@trpc/server';
import { acceptApplicationInputSchema, acceptApplicationResponseSchema, getAllApplicationsInputSchema, getAllApplicationsResponseSchema, getApplicationByIdInputSchema, getApplicationByIdResponseSchema, rejectApplicationInputSchema, rejectApplicationResponseSchema, requestedLeaseInputSchema, requestedLeaseResponseSchema } from '../../models/lease.models.js';
import { adminProcedure, leaserProcedure, ownerProcedure, protectedProcedure, router } from '../../trpc.js';
export const leaseRouter = router({
    /**
     * STEP 1: LEASER SUBMITS APPLICATION
     * Only accessible by users with 'LEASER' role.
     */
    Submitapplication: leaserProcedure
        .meta({ openapi: { method: 'POST', path: '/lease/submit-application', description: 'Submit a lease application' } })
        .input(requestedLeaseInputSchema)
        .output(requestedLeaseResponseSchema)
        .mutation(async ({ ctx, input }) => {
        const land = await ctx.prisma.land.findUnique({ where: { id: input.landId } });
        if (!land || land.status !== 'AVAILABLE') {
            throw new TRPCError({ code: 'BAD_REQUEST', message: 'Land is not available' });
        }
        const leaseApplication = await ctx.prisma.application.create({
            data: {
                leaserId: ctx.user.id, // Secure: use verified ID from token
                landId: input.landId,
                leaseDurationInMonths: input.leaseDurationInMonths,
                proposedMonthlyRent: input.proposedMonthlyRent,
                plans: input.plans,
                additionalMessages: input.additionalMessages ?? null,
            },
        });
        return {
            leaseAgreementId: leaseApplication.id,
            leaserId: leaseApplication.leaserId,
            landId: leaseApplication.landId,
            leaseDurationInMonths: leaseApplication.leaseDurationInMonths,
            proposedMonthlyRent: leaseApplication.proposedMonthlyRent,
        };
    }),
    /**
     * STEP 2: OWNER ACCEPTS APPLICATION
     * Only accessible by users with 'OWNER' role.
     */
    AcceptApplication: ownerProcedure
        .meta({ openapi: { method: 'POST', path: '/lease/accept-application', description: 'Accept a lease application' } })
        .input(acceptApplicationInputSchema)
        .output(acceptApplicationResponseSchema)
        .mutation(async ({ ctx, input }) => {
        const application = await ctx.prisma.application.findUnique({
            where: { id: input.applicationId },
            include: { land: true },
        });
        if (!application)
            throw new TRPCError({ code: 'NOT_FOUND', message: 'Application not found' });
        // Security: Ensure the user owns the land associated with this application
        if (application.land.ownerId !== ctx.user.id) {
            throw new TRPCError({ code: 'FORBIDDEN', message: 'You do not own this land listing' });
        }
        const updatedApplication = await ctx.prisma.application.update({
            where: { id: input.applicationId },
            data: { status: 'ACCEPTED' },
        });
        // Update land to 'IN_NEGOTIATION' and reject all other pending apps
        await ctx.prisma.$transaction([
            ctx.prisma.land.update({
                where: { id: application.landId },
                data: { status: 'IN_NEGOTIATION' },
            }),
            ctx.prisma.application.updateMany({
                where: {
                    landId: application.landId,
                    id: { not: input.applicationId },
                    status: 'PENDING',
                },
                data: { status: 'REJECTED' },
            }),
        ]);
        return {
            success: true,
            message: 'Application accepted successfully',
            application: {
                id: updatedApplication.id,
                status: updatedApplication.status,
                leaserId: updatedApplication.leaserId,
                landId: updatedApplication.landId,
            },
        };
    }),
    /**
     * STEP 2b: OWNER REJECTS APPLICATION
     */
    RejectApplication: ownerProcedure
        .meta({ openapi: { method: 'POST', path: '/lease/reject-application', description: 'Reject a lease application' } })
        .input(rejectApplicationInputSchema)
        .output(rejectApplicationResponseSchema)
        .mutation(async ({ ctx, input }) => {
        const application = await ctx.prisma.application.findUnique({
            where: { id: input.applicationId },
            include: { land: true },
        });
        if (!application || application.land.ownerId !== ctx.user.id) {
            throw new TRPCError({ code: 'FORBIDDEN', message: 'Unauthorized action' });
        }
        const updatedApplication = await ctx.prisma.application.update({
            where: { id: input.applicationId },
            data: { status: 'REJECTED' },
        });
        return {
            success: true,
            message: input.reason ? `Rejected: ${input.reason}` : 'Rejected successfully',
            application: { id: updatedApplication.id, status: updatedApplication.status },
        };
    }),
    /**
     * STEP 3: LEASER PAYS ESCROW
     * This procedure verifies the Khalti/eSewa transaction and locks the funds.
     */
    // PayEscrow: leaserProcedure
    //   .meta({ openapi: { method: 'POST', path: '/lease/pay-escrow', description: 'Pay the initial escrow amount' } })
    //   .input(payEscrowInputSchema)
    //   .output(payEscrowResponseSchema)
    //   .mutation(async ({ ctx, input }) => {
    //     const application = await ctx.prisma.application.findUnique({
    //       where: { id: input.applicationId },
    //     });
    //     if (!application || application.leaserId !== ctx.user.id) {
    //       throw new TRPCError({ code: 'FORBIDDEN', message: 'You can only pay for your own applications' });
    //     }
    //     // In a real app, you would verify the pidx (Khalti) or transaction_uuid (eSewa) here via Axios.
    //     const escrow = await ctx.prisma.escrow.create({
    //       data: {
    //         applicationId: input.applicationId,
    //         amount: input.amount,
    //         status: 'HELD', // Funds are now safely held by the system
    //         transactionId: input.transactionId,
    //       },
    //     });
    //     return { success: true, escrowId: escrow.id, status: escrow.status };
    //   }),
    /**
     * STEP 4: ADMIN VERIFIES MALPOT PAPERS
     * Final step to release funds to owner and mark land as LEASED.
     */
    /**
     * DATA QUERIES
     */
    GetApplicationById: protectedProcedure
        .meta({ openapi: { method: 'GET', path: '/lease/application/{applicationId}', description: 'Get a lease application by ID' } })
        .input(getApplicationByIdInputSchema)
        .output(getApplicationByIdResponseSchema)
        .query(async ({ ctx, input }) => {
        const application = await ctx.prisma.application.findUnique({
            where: { id: input.applicationId },
            include: { land: true, leaser: true },
        });
        if (!application)
            throw new TRPCError({ code: 'NOT_FOUND' });
        // Security: Check if user is either the leaser, the owner, or an admin
        const isLeaser = application.leaserId === ctx.user.id;
        const isOwner = application.land.ownerId === ctx.user.id;
        const isAdmin = ctx.user.role === 'ADMIN';
        if (!isLeaser && !isOwner && !isAdmin) {
            throw new TRPCError({ code: 'FORBIDDEN', message: 'You are not a party to this application' });
        }
        return application;
    }),
    GetAllApplications: adminProcedure
        .meta({ openapi: { method: 'GET', path: '/lease/applications', description: 'Get all lease applications' } })
        .input(getAllApplicationsInputSchema)
        .output(getAllApplicationsResponseSchema)
        .query(async ({ ctx, input }) => {
        const whereClause = {};
        if (input.status)
            whereClause.status = input.status;
        if (input.landId)
            whereClause.landId = input.landId;
        if (input.leaserId)
            whereClause.leaserId = input.leaserId;
        const applications = await ctx.prisma.application.findMany({
            where: whereClause,
            include: { land: true, leaser: true },
            orderBy: { createdAt: 'desc' },
        });
        return { applications, total: applications.length };
    }),
});
//# sourceMappingURL=lease.routes.js.map