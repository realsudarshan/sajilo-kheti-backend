import { TRPCError } from '@trpc/server';
import { EscrowStatus } from '@prisma/client';
import {
  getEscrowByIdResponseSchema,
  getMyEscrowsResponseSchema,
  getMyOwnerEscrowsResponseSchema,
  payEscrowInputSchema,
  payEscrowResponseSchema,
  saveChatChannelInputSchema,
  saveChatChannelResponseSchema,
  verifyMalpotPapersInputSchema,
  verifyMalpotPapersResponseSchema,
} from '../../models/escrow.models.js';
import { adminProcedure, leaserProcedure, ownerProcedure, protectedProcedure, router } from '../../trpc.js';
import { payEscrowService } from '../../services/escrow.service.js';
import { posthog } from '../../lib/analytics.js';
import z from 'zod';
import { sendPushNotification } from '../../lib/push.js';

export const escrowRouter = router({
  PayEscrow: leaserProcedure
    .meta({
      openapi: {
        method: 'POST',
        path: '/lease/pay-escrow',
        description: 'Leaser pays the escrow amount.',
      },
    })
    .input(payEscrowInputSchema)
    .output(payEscrowResponseSchema)
    .mutation(async ({ ctx, input }) => {
      const application = await ctx.prisma.application.findUnique({
        where:   { id: input.applicationId },
        include: { land: true, escrow: true },
      });

      if (!application) {
        throw new TRPCError({ code: 'NOT_FOUND', message: 'Application not found' });
      }
      if (application.leaserId !== ctx.user.id) {
        throw new TRPCError({ code: 'FORBIDDEN', message: 'Unauthorized' });
      }
      if (application.status !== 'ACCEPTED') {
        throw new TRPCError({ code: 'BAD_REQUEST', message: 'Application must be ACCEPTED before paying escrow' });
      }
      if (application.escrow) {
        throw new TRPCError({ code: 'BAD_REQUEST', message: 'Escrow payment already exists for this application' });
      }
      if (application.land.status !== 'IN_NEGOTIATION') {
        throw new TRPCError({ code: 'BAD_REQUEST', message: 'Land must be in IN_NEGOTIATION status.' });
      }

      const escrow = await ctx.prisma.escrow.create({
        data: {
          applicationId: input.applicationId,
          ownerId:       application.land.ownerId,
          leaserId:      application.leaserId,
          amount:        input.amount,
          paymentId:     input.paymentId,
          commission:    input.commission,
          status:        'HOLDING',
        },
      });

      posthog.capture({
        distinctId: ctx.user.id,
        event: 'escrow_paid',
        properties: {
          escrow_id:      escrow.id,
          application_id: input.applicationId,
          amount:         input.amount,
          commission:     input.commission,
          land_id:        application.landId,
          owner_id:       application.land.ownerId,
        },
      });

      // Notify the land owner
      await sendPushNotification(application.land.ownerId, {
        title: 'Escrow Paid! 💰',
        body: `The leaser has deposited Rs. ${input.amount} into Escrow for ${application.land.title}.`,
        url: `/dashboard/escrows`
      });

      return {
        success: true,
        message: 'Escrow payment successful. You can now arrange to meet at Malpot Karyalaya.',
        escrow: {
          id:            escrow.id,
          applicationId: escrow.applicationId,
          amount:        escrow.amount,
          status:        escrow.status,
        },
        landStatus: application.land.status,
      };
    }),

  VerifyMalpotPapers: adminProcedure
    .meta({
      openapi: {
        method: 'POST',
        path: '/lease/verify-malpot-papers',
        description: 'Admin verifies papers and releases funds.',
      },
    })
    .input(verifyMalpotPapersInputSchema)
    .output(verifyMalpotPapersResponseSchema)
    .mutation(async ({ ctx, input }) => {
      const application = await ctx.prisma.application.findUnique({
        where:   { id: input.applicationId },
        include: { land: true, escrow: true },
      });

      if (!application) {
        throw new TRPCError({ code: 'NOT_FOUND', message: 'Record not found' });
      }
      if (!application.escrow) {
        throw new TRPCError({ code: 'BAD_REQUEST', message: 'Missing escrow payment' });
      }
      if (application.escrow.status !== EscrowStatus.HOLDING) {
        throw new TRPCError({
          code:    'BAD_REQUEST',
          message: 'Escrow payment must be HELD before verification',
        });
      }

      const results = await ctx.prisma.$transaction([
        ctx.prisma.leaseAgreement.upsert({
          where:  { applicationId: input.applicationId },
          create: { applicationId: input.applicationId, malpotPaperUrl: input.malpotPaperUrl, adminVerified: true, verifiedAt: new Date() },
          update: { malpotPaperUrl: input.malpotPaperUrl, adminVerified: true, verifiedAt: new Date() },
        }),
        ctx.prisma.application.update({ where: { id: input.applicationId }, data: { status: 'COMPLETED' } }),
        ctx.prisma.land.update({ where: { id: application.landId }, data: { status: 'LEASED' } }),
        ctx.prisma.escrow.update({ where: { id: application.escrow.id }, data: { status: 'RELEASED' } }),
      ]);

      posthog.capture({
        distinctId: ctx.user.id,
        event: 'malpot_verified',
        properties: {
          application_id: input.applicationId,
          land_id:        application.landId,
          escrow_id:      application.escrow.id,
          escrow_amount:  application.escrow.amount,
        },
      });

      return {
        success:      true,
        message:      'Malpot papers verified. Funds released to owner.',
        application:  { id: results[1].id, status: results[1].status },
        landStatus:   results[2].status,
        escrowStatus: results[3].status,
      };
    }),

  SaveChatChannel: leaserProcedure
    .meta({
      openapi: {
        method: 'POST',
        path: '/escrow/save-chat-channel',
        description: 'Saves the Stream Chat channel ID to the escrow record.',
      },
    })
    .input(saveChatChannelInputSchema)
    .output(saveChatChannelResponseSchema)
    .mutation(async ({ ctx, input }) => {
      const application = await ctx.prisma.application.findUnique({
        where:   { id: input.applicationId },
        include: { escrow: true },
      });

      if (!application) {
        throw new TRPCError({ code: 'NOT_FOUND', message: 'Application not found' });
      }
      if (application.leaserId !== ctx.user.id) {
        throw new TRPCError({ code: 'FORBIDDEN', message: 'Unauthorized' });
      }
      if (!application.escrow) {
        throw new TRPCError({ code: 'BAD_REQUEST', message: 'No escrow found for this application' });
      }

      await ctx.prisma.escrow.update({
        where: { id: application.escrow.id },
        data:  { chatChannelId: input.chatChannelId },
      });

      return { success: true, message: 'Chat channel saved.' };
    }),

  GetMyEscrows: leaserProcedure
    .meta({
      openapi: {
        method: 'GET',
        path: '/escrow/my-escrows',
        description: 'Get all escrows for the logged-in leaser.',
      },
    })
    .input(z.object({}))
    .output(getMyEscrowsResponseSchema)
    .query(async ({ ctx }) => {
      const escrows = await ctx.prisma.escrow.findMany({
        where:   { leaserId: ctx.user.id },
        include: {
          application: {
            include: {
              land: {
                select: {
                  id:           true,
                  title:        true,
                  location:     true,
                  heroImageUrl: true,
                  status:       true,
                },
              },
            },
          },
        },
        orderBy: { createdAt: 'desc' },
      });

      return { escrows };
    }),

  GetMyOwnerEscrows: ownerProcedure
    .meta({
      openapi: {
        method: 'GET',
        path: '/escrow/my-owner-escrows',
        description: 'Get all escrows where the logged-in user is the land owner.',
      },
    })
    .input(z.object({}))
    .output(getMyOwnerEscrowsResponseSchema)
    .query(async ({ ctx }) => {
      const escrows = await ctx.prisma.escrow.findMany({
        where:   { ownerId: ctx.user.id },
        include: {
          application: {
            include: {
              land: {
                select: {
                  id:           true,
                  title:        true,
                  location:     true,
                  heroImageUrl: true,
                  status:       true,
                },
              },
            },
          },
        },
        orderBy: { createdAt: 'desc' },
      });

      return { escrows };
    }),

  GetEscrowById: protectedProcedure
    .meta({
      openapi: {
        method: 'GET',
        path: '/escrow/{id}',
        description: 'Get details of a specific escrow by ID.',
      },
    })
    .input(z.object({ id: z.string() }))
    .output(getEscrowByIdResponseSchema)
    .query(async ({ ctx, input }) => {
      const escrow = await ctx.prisma.escrow.findUnique({
        where: { id: input.id },
        include: {
          application: {
            include: {
              land: {
                select: {
                  id:           true,
                  title:        true,
                  location:     true,
                  heroImageUrl: true,
                },
              },
            },
          },
        },
      });

      if (!escrow) {
        throw new TRPCError({ code: 'NOT_FOUND', message: 'Escrow record not found' });
      }

      const isLeaser = escrow.leaserId === ctx.user.id;
      const isOwner  = escrow.ownerId  === ctx.user.id;
      const isAdmin  = ctx.user.role   === 'ADMIN';

      if (!isLeaser && !isOwner && !isAdmin) {
        throw new TRPCError({ code: 'FORBIDDEN', message: 'You do not have permission to view this escrow' });
      }

      return escrow;
    }),

  SubmitMalpotPapers: protectedProcedure
    .meta({
      openapi: {
        method: 'POST',
        path: '/lease/submit-malpot-papers',
        description: 'Submit the signed Malpot agreement (Owner or Leaser).',
      },
    })
    .input(z.object({
      escrowId:       z.string(),
      malpotPaperUrl: z.string().url(),
    }))
    .output(z.object({ success: z.boolean(), message: z.string() }))
    .mutation(async ({ ctx, input }) => {
      const escrow = await ctx.prisma.escrow.findUnique({
        where: { id: input.escrowId },
      });

      if (!escrow) {
        throw new TRPCError({ code: 'NOT_FOUND', message: 'Escrow record not found' });
      }

      const isLeaser = escrow.leaserId === ctx.user.id;
      const isOwner  = escrow.ownerId  === ctx.user.id;

      if (!isLeaser && !isOwner) {
        throw new TRPCError({ code: 'FORBIDDEN', message: 'Access denied. You are not a party to this transaction.' });
      }

      const updateData = isOwner
        ? { landownerMalpotUrl:  input.malpotPaperUrl }
        : { landleaserMalpotUrl: input.malpotPaperUrl };

      await ctx.prisma.escrow.update({
        where: { id: input.escrowId },
        data:  updateData,
      });

      posthog.capture({
        distinctId: ctx.user.id,
        event: 'malpot_submitted',
        properties: {
          escrow_id: input.escrowId,
          role:      isOwner ? 'OWNER' : 'LEASER',
        },
      });

      return {
        success: true,
        message: `Document successfully uploaded as ${isOwner ? 'Landowner' : 'Leaser'}.`,
      };
    }),

  GetAllEscrowsForAdmin: adminProcedure
    .query(async ({ ctx }) => {
      return await ctx.prisma.escrow.findMany({
        where: {
          AND: [
            { landownerMalpotUrl:  { not: null } },
            { landownerMalpotUrl:  { not: ""   } },
            { landleaserMalpotUrl: { not: null } },
            { landleaserMalpotUrl: { not: ""   } },
          ],
        },
        include: {
          owner:  { select: { name: true } },
          leaser: { select: { name: true } },
          application: {
            include: {
              land: { select: { title: true, location: true } },
            },
          },
        },
        orderBy: { updatedAt: 'desc' },
      });
    }),

  VerifyLegalDocuments: adminProcedure
    .input(z.object({
      escrowId: z.string(),
      action:   z.enum(["APPROVE", "REJECT"]),
    }))
    .mutation(async ({ ctx, input }) => {
      const { escrowId, action } = input;

      if (action === "APPROVE") {
        const escrow = await ctx.prisma.escrow.findUnique({
          where:  { id: escrowId },
          select: {
            applicationId: true,
            amount:        true,
            ownerId:       true,
            application:   { select: { landId: true, leaserId: true } },
          },
        });

        if (!escrow || !escrow.applicationId) {
          throw new TRPCError({ code: "NOT_FOUND", message: "Escrow or linked application not found" });
        }

        const result = await ctx.prisma.$transaction([
          ctx.prisma.escrow.update({
            where: { id: escrowId },
            data:  { status: "RELEASED" },
          }),
          ctx.prisma.application.update({
            where: { id: escrow.applicationId },
            data:  { status: "COMPLETED" },
          }),
          ctx.prisma.land.update({
            where: { id: escrow.application.landId },
            data:  { status: "LEASED" },
          }),
        ]);

        posthog.capture({
          distinctId: ctx.user.id,
          event: 'lease_completed',
          properties: {
            escrow_id:      escrowId,
            application_id: escrow.applicationId,
            land_id:        escrow.application.landId,
            escrow_amount:  escrow.amount,
          },
        });

        // Notify leaser
        await sendPushNotification(escrow.application.leaserId, {
          title: 'Lease Completed! 🎉',
          body: `The Malpot documents were verified and the lease is now active.`,
          url: `/dashboard/my-leases`
        });

        // Notify owner
        await sendPushNotification(escrow.ownerId, {
          title: 'Escrow Released! 💸',
          body: `Escrow funds of Rs. ${escrow.amount} have been released to your account.`,
          url: `/dashboard/my-owner-escrows`
        });

        return result;
      } else {
        const result = await ctx.prisma.escrow.update({
          where: { id: escrowId },
          data: {
            landownerMalpotUrl:  null,
            landleaserMalpotUrl: null,
            status:              "HOLDING",
          },
        });

        posthog.capture({
          distinctId: ctx.user.id,
          event: 'malpot_rejected',
          properties: { escrow_id: escrowId },
        });

        // Notify both parties of rejection
        const escRowRej = await ctx.prisma.escrow.findUnique({
          where: { id: escrowId },
          select: { ownerId: true, leaserId: true }
        });
        if (escRowRej) {
          const msg = { title: 'Legal Documents Rejected ❌', body: 'The Malpot documents were rejected by the Admin. Please re-upload.', url: `/dashboard/escrows` };
          await sendPushNotification(escRowRej.ownerId, msg);
          await sendPushNotification(escRowRej.leaserId, msg);
        }

        return result;
      }
    }),

  GetAllEscrowsAgreementForAdmin: adminProcedure
    .meta({
      openapi: {
        method: 'GET',
        path: '/escrow/admin/agreements',
        description: 'Get all escrows that have a verified lease agreement (admin only)',
      },
    })
    .output(z.any())
    .query(async ({ ctx }) => {
      const escrows = await ctx.prisma.escrow.findMany({
        where: {
          AND: [
            { landownerMalpotUrl:  { not: null } },
            { landownerMalpotUrl:  { not: ""   } },
            { landleaserMalpotUrl: { not: null } },
            { landleaserMalpotUrl: { not: ""   } },
          ],
        },
        include: {
          owner:  { select: { name: true } },
          leaser: { select: { name: true } },
          application: {
            include: {
              land: { select: { title: true, location: true } },
            },
          },
        },
        orderBy: { updatedAt: 'desc' },
      });

      return { escrows };
    }),
});