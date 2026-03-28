import { TRPCError } from '@trpc/server';
import {
  acceptApplicationInputSchema,
  acceptApplicationResponseSchema,
  getAllApplicationsInputSchema,
  getAllApplicationsResponseSchema,
  getApplicationByIdInputSchema,
  getApplicationByIdResponseSchema,
  getMyAcceptedApplicationsInputSchema,
  getMyAcceptedApplicationsResponseSchema,
  rejectApplicationInputSchema,
  rejectApplicationResponseSchema,
  requestedLeaseInputSchema,
  requestedLeaseResponseSchema
} from '../../models/lease.models.js';
import {
  adminProcedure,
  leaserProcedure,
  ownerProcedure,
  protectedProcedure,
  router
} from '../../trpc.js';
import { posthog } from '../../lib/analytics.js';
import z from 'zod';
import { sendPushNotification } from '../../lib/push.js';

export const leaseRouter = router({
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
          leaserId:              ctx.user.id,
          landId:                input.landId,
          leaseDurationInMonths: input.leaseDurationInMonths,
          proposedMonthlyRent:   input.proposedMonthlyRent,
          plans:                 input.plans,
          additionalMessages:    input.additionalMessages ?? null,
        },
      });

      posthog.capture({
        distinctId: ctx.user.id,
        event: 'application_submitted',
        properties: {
          application_id:         leaseApplication.id,
          land_id:                input.landId,
          proposed_monthly_rent:  input.proposedMonthlyRent,
          lease_duration_months:  input.leaseDurationInMonths,
          land_owner_id:          land.ownerId,
        },
      });

      // Notify the land owner
      await sendPushNotification(land.ownerId, {
        title: 'New Lease Application',
        body: `Someone wants to lease your land: ${land.title}.`,
        url: `/dashboard/applications`
      });

      return {
        leaseAgreementId:      leaseApplication.id,
        leaserId:              leaseApplication.leaserId,
        landId:                leaseApplication.landId,
        leaseDurationInMonths: leaseApplication.leaseDurationInMonths,
        proposedMonthlyRent:   leaseApplication.proposedMonthlyRent,
      };
    }),

  AcceptApplication: ownerProcedure
    .meta({ openapi: { method: 'POST', path: '/lease/accept-application', description: 'Accept a lease application' } })
    .input(acceptApplicationInputSchema)
    .output(acceptApplicationResponseSchema)
    .mutation(async ({ ctx, input }) => {
      const application = await ctx.prisma.application.findUnique({
        where: { id: input.applicationId },
        include: { land: true },
      });

      if (!application) throw new TRPCError({ code: 'NOT_FOUND', message: 'Application not found' });

      if (application.land.ownerId !== ctx.user.id) {
        throw new TRPCError({ code: 'FORBIDDEN', message: 'You do not own this land listing' });
      }

      const updatedApplication = await ctx.prisma.application.update({
        where: { id: input.applicationId },
        data:  { status: 'ACCEPTED' },
      });

      await ctx.prisma.$transaction([
        ctx.prisma.land.update({
          where: { id: application.landId },
          data:  { status: 'IN_NEGOTIATION' },
        }),
        ctx.prisma.application.updateMany({
          where: {
            landId: application.landId,
            id:     { not: input.applicationId },
            status: 'PENDING',
          },
          data: { status: 'REJECTED' },
        }),
      ]);

      posthog.capture({
        distinctId: ctx.user.id,
        event: 'application_accepted',
        properties: {
          application_id: input.applicationId,
          leaser_id:      application.leaserId,
          land_id:        application.landId,
        },
      });

      // Notify the leaser
      await sendPushNotification(application.leaserId, {
        title: 'Application Accepted! 🎉',
        body: `Your application for ${application.land.title} was accepted! Please complete the escrow payment to lock it in.`,
        url: `/checkout/${application.id}`
      });

      return {
        success: true,
        message: 'Application accepted successfully',
        application: {
          id:       updatedApplication.id,
          status:   updatedApplication.status,
          leaserId: updatedApplication.leaserId,
          landId:   updatedApplication.landId,
        },
      };
    }),

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
        data:  { status: 'REJECTED' },
      });

      posthog.capture({
        distinctId: ctx.user.id,
        event: 'application_rejected',
        properties: {
          application_id: input.applicationId,
          leaser_id:      application.leaserId,
          land_id:        application.landId,
          reason:         input.reason ?? null,
        },
      });

      return {
        success: true,
        message: input.reason ? `Rejected: ${input.reason}` : 'Rejected successfully',
        application: { id: updatedApplication.id, status: updatedApplication.status },
      };
    }),

  GetApplicationById: protectedProcedure
    .meta({ openapi: { method: 'GET', path: '/lease/application/{applicationId}', description: 'Get a lease application by ID' } })
    .input(getApplicationByIdInputSchema)
    .output(getApplicationByIdResponseSchema)
    .query(async ({ ctx, input }) => {
      const application = await ctx.prisma.application.findUnique({
        where:   { id: input.applicationId },
        include: { land: true, leaser: true },
      });

      if (!application) throw new TRPCError({ code: 'NOT_FOUND' });

      const isLeaser = application.leaserId     === ctx.user.id;
      const isOwner  = application.land.ownerId === ctx.user.id;
      const isAdmin  = ctx.user.role            === 'ADMIN';

      if (!isLeaser && !isOwner && !isAdmin) {
        throw new TRPCError({ code: 'FORBIDDEN', message: 'You are not a party to this application' });
      }

      return application;
    }),

  GetAllApplications: ownerProcedure
    .meta({ openapi: { method: 'GET', path: '/lease/applications', description: 'Get all lease applications' } })
    .input(getAllApplicationsInputSchema)
    .output(getAllApplicationsResponseSchema)
    .query(async ({ ctx, input }) => {
      const whereClause: any = {};
      if (input.status)   whereClause.status   = input.status;
      if (input.landId)   whereClause.landId   = input.landId;
      if (input.leaserId) whereClause.leaserId = input.leaserId;

      const applications = await ctx.prisma.application.findMany({
        where:   whereClause,
        include: { land: true, leaser: true },
        orderBy: { createdAt: 'desc' },
      });

      return { applications, total: applications.length };
    }),

  GetMyAcceptedApplications: leaserProcedure
    .meta({
      openapi: {
        method: 'GET',
        path: '/lease/my-accepted-applications',
        description: 'Get all accepted applications for the logged-in leaser',
      },
    })
    .input(getMyAcceptedApplicationsInputSchema)
    .output(getMyAcceptedApplicationsResponseSchema)
    .query(async ({ ctx, input }) => {
      const applications = await ctx.prisma.application.findMany({
        where: {
          leaserId: ctx.user.id,
          status:   'ACCEPTED',
          ...(input.landId && { landId: input.landId }),
        },
        include: { land: true, leaser: true },
        orderBy: { createdAt: 'desc' },
      });

      return { applications, total: applications.length };
    }),

  GetMyLeaserApplications: leaserProcedure
    .meta({
      openapi: {
        method: 'GET',
        path: '/lease/my-applications',
        description: 'Get all lease applications submitted by the logged-in leaser',
      },
    })
    .input(z.object({
      status: z.enum(['PENDING', 'ACCEPTED', 'REJECTED', 'COMPLETED']).optional(),
    }))
    .output(getAllApplicationsResponseSchema)
    .query(async ({ ctx, input }) => {
      const applications = await ctx.prisma.application.findMany({
        where: {
          leaserId: ctx.user.id,
          ...(input.status && { status: input.status }),
        },
        include: { land: true, leaser: true },
        orderBy: { createdAt: 'desc' },
      });

      return { applications, total: applications.length };
    }),

  GetMyApplications: leaserProcedure
    .input(z.object({
      status: z.enum(['PENDING', 'ACCEPTED', 'REJECTED', 'COMPLETED']).optional(),
    }))
    .output(getAllApplicationsResponseSchema)
    .query(async ({ ctx, input }) => {
      const applications = await ctx.prisma.application.findMany({
        where: {
          leaserId: ctx.user.id,
          ...(input.status && { status: input.status }),
        },
        include: { land: true, leaser: true },
        orderBy: { createdAt: 'desc' },
      });

      return { applications, total: applications.length };
    }),
});