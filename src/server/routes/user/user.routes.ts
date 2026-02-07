import { clerkClient } from '@clerk/express';
import type { Prisma } from '@prisma/client';
import { TRPCError } from '@trpc/server';
import {
  createUserInputSchema,
  createUserResponseSchema,
  getAllUsersResponseSchema,
  updateKycStatusInputSchema,
  updateKycStatusResponseSchema,
  upgradeRequestInputSchema,
  upgradeRequestResponseSchema,
} from '../../models/user.models.js';
import {
  adminProcedure,
  protectedProcedure,
  publicProcedure,
  router,
} from '../../trpc.js';

export const userRouter = router({
  getAllUser: adminProcedure
    .output(getAllUsersResponseSchema)
    .query(async ({ ctx }) => {
      const users = await ctx.prisma.user.findMany({
        select: {
          id: true,
          role: true,
          isKycVerified: true,
          createdAt: true,
        },
      });
      const clerkUsers = await clerkClient.users.getUserList({
        userId: users.map((u) => u.id),
      });
      const hydratedUsers = users.map((dbUser) => {
        const clerkInfo = clerkUsers.data.find((cu) => cu.id === dbUser.id);

        return {
          ...dbUser,
          // Extract specific fields from Clerk
          email: clerkInfo?.emailAddresses[0]?.emailAddress ?? 'No email',
          name: `${clerkInfo?.firstName ?? ''} ${clerkInfo?.lastName ?? ''}`.trim() || 'Unnamed',
          imageUrl: clerkInfo?.imageUrl,
        };
      });

      return { users: hydratedUsers };
    }),

  createUser: publicProcedure
    .input(createUserInputSchema)
    .output(createUserResponseSchema)
    .mutation(async ({ ctx, input }) => {
      return await ctx.prisma.user.upsert({
        where: { id: input.id },
        update: {},
        create: {
          id: input.id,
          role: 'LEASER',
        },
      });
    }),

  upgradeRequest: protectedProcedure
    .input(upgradeRequestInputSchema)
    .output(upgradeRequestResponseSchema)
    .mutation(async ({ ctx, input }) => {
      return await ctx.prisma.kycDetail.upsert({
        where: { userId: ctx.user.id },
        create: {
          userId: ctx.user.id,
          citizenshipNumber: input.citizenshipNumber,
          documentUrl: input.documentUrl,
          selfieUrl: input.selfieUrl ?? null,
          status: 'PENDING',
        },
        update: {
          citizenshipNumber: input.citizenshipNumber,
          documentUrl: input.documentUrl,
          selfieUrl: input.selfieUrl ?? null,
          status: 'PENDING',
        },
      });
    }),

  updateKycStatus: adminProcedure
    .input(updateKycStatusInputSchema)
    .output(updateKycStatusResponseSchema)
    .mutation(async ({ ctx, input }) => {
      return await ctx.prisma.$transaction(async (tx: Prisma.TransactionClient) => {
        const kyc = await tx.kycDetail.findUnique({
          where: { userId: input.userId },
        });

        if (!kyc) {
          throw new TRPCError({ code: 'NOT_FOUND', message: 'No KYC record' });
        }

        const updatedKyc = await tx.kycDetail.update({
          where: { userId: input.userId },
          data: { status: input.status },
        });

        const updatedUser = await tx.user.update({
          where: { id: input.userId },
          data: {
            isKycVerified: input.status === 'APPROVED',
            // Explicitly setting role to satisfy strict TS check
            role: input.status === 'APPROVED' ? 'OWNER' : 'LEASER',
          },
        });

        return {
          userId: updatedUser.id,
          kycStatus: updatedKyc.status,
          userRole: updatedUser.role,
          isKycVerified: updatedUser.isKycVerified,
        };
      });
    }),
  getKycDetails: protectedProcedure
    .query(async ({ ctx }) => {
      const kyc = await ctx.prisma.kycDetail.findUnique({
        where: { userId: ctx.user.id },
      });

      if (!kyc) {
        // We return null instead of throwing an error so the frontend 
        // can easily check "if (!data) showUploadForm()"
        return null;
      }

      return kyc;
    }),

  getAllKycDetails: adminProcedure
    .query(async ({ ctx }) => {
      const kycDetails = await ctx.prisma.kycDetail.findMany({
        include: {
          user: {
            select: {
              id: true,
              role: true,
              isKycVerified: true,
            },
          },
        },
      });

      // Hydrate with Clerk data
      const userIds = kycDetails.map(kyc => kyc.userId);
      const clerkUsers = await clerkClient.users.getUserList({
        userId: userIds,
      });

      const hydratedKycDetails = kycDetails.map((kyc) => {
        const clerkInfo = clerkUsers.data.find((cu) => cu.id === kyc.userId);

        return {
          ...kyc,
          userName: `${clerkInfo?.firstName ?? ''} ${clerkInfo?.lastName ?? ''}`.trim() || 'Unnamed',
          userEmail: clerkInfo?.emailAddresses[0]?.emailAddress ?? 'No email',
        };
      });

      return { kycDetails: hydratedKycDetails };
    }),
});