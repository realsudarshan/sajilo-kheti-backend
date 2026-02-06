import { TRPCError } from '@trpc/server';
import { acceptApplicationInputSchema, acceptApplicationResponseSchema, getAllApplicationsInputSchema, getAllApplicationsResponseSchema, getApplicationByIdInputSchema, getApplicationByIdResponseSchema, payEscrowInputSchema, payEscrowResponseSchema, rejectApplicationInputSchema, rejectApplicationResponseSchema, requestedLeaseInputSchema, requestedLeaseResponseSchema, verifyMalpotPapersInputSchema, verifyMalpotPapersResponseSchema } from '../../models/lease.models.js';
import { publicProcedure, router } from '../../trpc.js';
// Submitapplication, AcceptApplication, RejectApplication, GetAllApplications, GetApplicationByApplicationId
export const leaseRouter = router({
    Submitapplication: publicProcedure.meta({
        openapi: {
            method: 'POST',
            path: '/lease/submit-application',
            description: 'Submit a lease application',
        },
    })
        .input(requestedLeaseInputSchema)
        .output(requestedLeaseResponseSchema)
        .mutation(async ({ ctx, input }) => {
        // Verify that the land exists and is available
        const land = await ctx.prisma.land.findUnique({
            where: { id: input.landId },
        });
        if (!land) {
            throw new TRPCError({
                code: 'NOT_FOUND',
                message: 'Land not found'
            });
        }
        if (land.status !== 'AVAILABLE') {
            throw new TRPCError({
                code: 'BAD_REQUEST',
                message: 'Land is not available for lease applications'
            });
        }
        // Verify that the leaser exists
        const leaser = await ctx.prisma.user.findUnique({
            where: { id: input.leaserId },
        });
        if (!leaser) {
            throw new TRPCError({
                code: 'NOT_FOUND',
                message: 'Leaser not found'
            });
        }
        // Create the lease application
        const leaseApplication = await ctx.prisma.application.create({
            data: {
                leaserId: input.leaserId,
                landId: input.landId,
                leaseDurationInMonths: input.leaseDurationInMonths,
                proposedMonthlyRent: input.proposedMonthlyRent,
                plans: input.plans,
                additionalMessages: input.additionalMessages ?? null,
            },
        });
        // Land remains AVAILABLE until application is accepted
        return {
            leaseAgreementId: leaseApplication.id,
            leaserId: input.leaserId,
            landId: input.landId,
            leaseDurationInMonths: input.leaseDurationInMonths,
            proposedMonthlyRent: input.proposedMonthlyRent,
        };
    }),
    AcceptApplication: publicProcedure.meta({
        openapi: {
            method: 'POST',
            path: '/lease/accept-application',
            description: 'Accept a lease application',
        },
    })
        .input(acceptApplicationInputSchema)
        .output(acceptApplicationResponseSchema)
        .mutation(async ({ ctx, input }) => {
        // Find the application
        const application = await ctx.prisma.application.findUnique({
            where: { id: input.applicationId },
            include: {
                land: true,
            },
        });
        if (!application) {
            throw new TRPCError({
                code: 'NOT_FOUND',
                message: 'Application not found'
            });
        }
        if (application.status !== 'PENDING') {
            throw new TRPCError({
                code: 'BAD_REQUEST',
                message: `Application is already ${application.status.toLowerCase()}`
            });
        }
        // Update application status to ACCEPTED
        const updatedApplication = await ctx.prisma.application.update({
            where: { id: input.applicationId },
            data: { status: 'ACCEPTED' },
        });
        // Update land status to IN_NEGOTIATION
        // NOTE: This reserves the land. Chat and meeting will only happen AFTER Escrow Payment (Step 3).
        await ctx.prisma.land.update({
            where: { id: application.landId },
            data: { status: 'IN_NEGOTIATION' },
        });
        // Reject all other pending applications for this land
        await ctx.prisma.application.updateMany({
            where: {
                landId: application.landId,
                id: { not: input.applicationId },
                status: 'PENDING',
            },
            data: { status: 'REJECTED' },
        });
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
    RejectApplication: publicProcedure.meta({
        openapi: {
            method: 'POST',
            path: '/lease/reject-application',
            description: 'Reject a lease application',
        },
    })
        .input(rejectApplicationInputSchema)
        .output(rejectApplicationResponseSchema)
        .mutation(async ({ ctx, input }) => {
        // Find the application
        const application = await ctx.prisma.application.findUnique({
            where: { id: input.applicationId },
            include: {
                land: true,
            },
        });
        if (!application) {
            throw new TRPCError({
                code: 'NOT_FOUND',
                message: 'Application not found'
            });
        }
        if (application.status !== 'PENDING') {
            throw new TRPCError({
                code: 'BAD_REQUEST',
                message: `Application is already ${application.status.toLowerCase()}`
            });
        }
        // Update application status to REJECTED
        const updatedApplication = await ctx.prisma.application.update({
            where: { id: input.applicationId },
            data: { status: 'REJECTED' },
        });
        // Check if there are any other pending applications for this land
        const otherPendingApplications = await ctx.prisma.application.findMany({
            where: {
                landId: application.landId,
                status: 'PENDING',
            },
        });
        // If no other pending applications, set land status back to AVAILABLE
        // if (otherPendingApplications.length === 0) {
        //   await ctx.prisma.land.update({
        //     where: { id: application.landId },
        //     data: { status: 'AVAILABLE' },
        //   });
        // }
        return {
            success: true,
            message: input.reason
                ? `Application rejected: ${input.reason}`
                : 'Application rejected successfully',
            application: {
                id: updatedApplication.id,
                status: updatedApplication.status,
            },
        };
    }),
    GetApplicationById: publicProcedure.meta({
        openapi: {
            method: 'GET',
            path: '/lease/application/{applicationId}',
            description: 'Get a lease application by ID',
        },
    })
        .input(getApplicationByIdInputSchema)
        .output(getApplicationByIdResponseSchema)
        .query(async ({ ctx, input }) => {
        const application = await ctx.prisma.application.findUnique({
            where: { id: input.applicationId },
            include: {
                land: {
                    select: {
                        title: true,
                        location: true,
                        area: true,
                        pricePerMonth: true,
                    },
                },
                leaser: {
                    select: {
                        id: true,
                        name: true,
                        email: true,
                        phone: true,
                    },
                },
            },
        });
        if (!application) {
            throw new TRPCError({
                code: 'NOT_FOUND',
                message: 'Application not found'
            });
        }
        return {
            id: application.id,
            landId: application.landId,
            leaserId: application.leaserId,
            plans: application.plans,
            leaseDurationInMonths: application.leaseDurationInMonths,
            proposedMonthlyRent: application.proposedMonthlyRent,
            status: application.status,
            additionalMessages: application.additionalMessages,
            createdAt: application.createdAt,
            land: application.land,
            leaser: application.leaser,
        };
    }),
    GetAllApplications: publicProcedure.meta({
        openapi: {
            method: 'GET',
            path: '/lease/applications',
            description: 'Get all lease applications with optional filters',
        },
    })
        .input(getAllApplicationsInputSchema)
        .output(getAllApplicationsResponseSchema)
        .query(async ({ ctx, input }) => {
        // Build the where clause based on filters
        const whereClause = {};
        if (input.status) {
            whereClause.status = input.status;
        }
        if (input.landId) {
            whereClause.landId = input.landId;
        }
        if (input.leaserId) {
            whereClause.leaserId = input.leaserId;
        }
        // Fetch applications with related data
        const applications = await ctx.prisma.application.findMany({
            where: whereClause,
            include: {
                land: {
                    select: {
                        title: true,
                        location: true,
                        area: true,
                        pricePerMonth: true,
                    },
                },
                leaser: {
                    select: {
                        id: true,
                        name: true,
                        email: true,
                        phone: true,
                    },
                },
            },
            orderBy: {
                createdAt: 'desc',
            },
        });
        return {
            applications: applications.map(app => ({
                id: app.id,
                landId: app.landId,
                leaserId: app.leaserId,
                plans: app.plans,
                leaseDurationInMonths: app.leaseDurationInMonths,
                proposedMonthlyRent: app.proposedMonthlyRent,
                status: app.status,
                additionalMessages: app.additionalMessages,
                createdAt: app.createdAt,
                land: app.land,
                leaser: app.leaser,
            })),
            total: applications.length,
        };
    }),
    // Step 3: Leaser pays Escrow - Land status changes to IN_NEGOTIATION
    // Step 4: Admin verifies Malpot papers - Land becomes LEASED, Application COMPLETED
    VerifyMalpotPapers: publicProcedure.meta({
        openapi: {
            method: 'POST',
            path: '/lease/verify-malpot-papers',
            description: 'Admin verifies the Malpot agreement papers',
        },
    })
        .input(verifyMalpotPapersInputSchema)
        .output(verifyMalpotPapersResponseSchema)
        .mutation(async ({ ctx, input }) => {
        // Find the application
        const application = await ctx.prisma.application.findUnique({
            where: { id: input.applicationId },
            include: {
                land: true,
                escrow: true,
                agreement: true,
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
                message: 'Application must be ACCEPTED to verify papers'
            });
        }
        if (!application.escrow) {
            throw new TRPCError({
                code: 'BAD_REQUEST',
                message: 'Escrow payment not found. Payment must be made before verification.'
            });
        }
        if (application.land.status !== 'IN_NEGOTIATION') {
            throw new TRPCError({
                code: 'BAD_REQUEST',
                message: 'Land must be in IN_NEGOTIATION status'
            });
        }
        // Verify admin exists
        const admin = await ctx.prisma.user.findUnique({
            where: { id: input.adminId },
        });
        if (!admin || admin.role !== 'ADMIN') {
            throw new TRPCError({
                code: 'FORBIDDEN',
                message: 'Only admins can verify Malpot papers'
            });
        }
        // Create or update lease agreement
        const leaseAgreement = await ctx.prisma.leaseAgreement.upsert({
            where: { applicationId: input.applicationId },
            create: {
                applicationId: input.applicationId,
                malpotPaperUrl: input.malpotPaperUrl,
                adminVerified: true,
                verifiedAt: new Date(),
            },
            update: {
                malpotPaperUrl: input.malpotPaperUrl,
                adminVerified: true,
                verifiedAt: new Date(),
            },
        });
        // Update application status to COMPLETED
        const updatedApplication = await ctx.prisma.application.update({
            where: { id: input.applicationId },
            data: { status: 'COMPLETED' },
        });
        // Update land status to LEASED
        const updatedLand = await ctx.prisma.land.update({
            where: { id: application.landId },
            data: { status: 'LEASED' },
        });
        // Release escrow funds
        const updatedEscrow = await ctx.prisma.escrow.update({
            where: { id: application.escrow.id },
            data: { status: 'RELEASED' },
        });
        return {
            success: true,
            message: 'Malpot papers verified successfully. Escrow funds released to land owner.',
            application: {
                id: updatedApplication.id,
                status: updatedApplication.status,
            },
            landStatus: updatedLand.status,
            escrowStatus: updatedEscrow.status,
        };
    }),
});
//# sourceMappingURL=lease.routes.js.map