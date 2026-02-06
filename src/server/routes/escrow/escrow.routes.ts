import { TRPCError } from '@trpc/server';
// 1. Import your EscrowStatus Enum from the Prisma Client
import { EscrowStatus } from '@prisma/client'; 
import {
  EscrowModel,
  payEscrowInputSchema,
  payEscrowResponseSchema,
  verifyMalpotPapersInputSchema,
  verifyMalpotPapersResponseSchema
} from "../../models/escrow.models.js";
import { adminProcedure, leaserProcedure, router } from "../../trpc.js";

export const escrowRouter = router({
  /**
   * STEP 3: PAY ESCROW
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
        where: { id: input.applicationId },
      });

      if (!application) {
        throw new TRPCError({ code: 'NOT_FOUND', message: 'Application not found' });
      }

      if (application.leaserId !== ctx.user.id) {
        throw new TRPCError({ code: 'FORBIDDEN', message: 'Unauthorized' });
      }

      return await EscrowModel.payEscrow(ctx, input);
    }),

  /**
   * STEP 4: VERIFY MALPOT PAPERS
   */
  VerifyMalpotPapers: adminProcedure
    .meta({
      openapi: {
        method: 'POST',
        path: '/lease/verify-malpot-papers',
        description: 'Admin verifies papers and releases funds.'
      }
    })
    .input(verifyMalpotPapersInputSchema)
    .output(verifyMalpotPapersResponseSchema)
    .mutation(async ({ ctx, input }) => {
      const application = await ctx.prisma.application.findUnique({
        where: { id: input.applicationId },
        include: { escrow: true }
      });

      if (!application) {
        throw new TRPCError({ code: 'NOT_FOUND', message: 'Record not found' });
      }

      // 2. FIXED COMPARISON: Use the Enum instead of a raw string
      if (!application.escrow || application.escrow.status !== EscrowStatus.HOLDING) {
        throw new TRPCError({
          code: 'BAD_REQUEST',
          message: 'Escrow payment must be HELD before verification',
        });
      }

      return await EscrowModel.verifyMalpotPapers(ctx, input);
    }),
});