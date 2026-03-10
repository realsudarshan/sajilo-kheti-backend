// BACKEND: src/server/routes/escrow/escrow.routes.ts
// Full replacement — PayEscrow now delegates to payEscrowService

import { TRPCError } from '@trpc/server';
import { EscrowStatus } from '@prisma/client';
import {
  payEscrowInputSchema,
  payEscrowResponseSchema,
  verifyMalpotPapersInputSchema,
  verifyMalpotPapersResponseSchema,
} from '../../models/escrow.models.js';
import { adminProcedure, leaserProcedure, router } from '../../trpc.js';
import { payEscrowService } from '../../services/escrow.service.js';

export const escrowRouter = router({
  /**
   * STEP 3: PAY ESCROW
   * Now delegates to payEscrowService so the same logic
   * can be called from the Next.js API route too.
   */
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

      // Create escrow — ownerId comes from the land, leaserId from the application
      const escrow = await ctx.prisma.escrow.create({
        data: {
          applicationId: input.applicationId,
          ownerId:       application.land.ownerId,   // ← land owner
          leaserId:      application.leaserId,        // ← leaser who applied
          amount:        input.amount,
          paymentId:     input.paymentId,
          commission:    input.commission,
          status:        'HOLDING',
        },
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


  /**
   * STEP 4: VERIFY MALPOT PAPERS (Admin)
   */
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

      return {
        success:      true,
        message:      'Malpot papers verified. Funds released to owner.',
        application:  { id: results[1].id, status: results[1].status },
        landStatus:   results[2].status,
        escrowStatus: results[3].status,
      };
    }),
});