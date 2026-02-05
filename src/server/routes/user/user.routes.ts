import { TRPCError } from '@trpc/server';
import z from 'zod';
import { adminProcedure, publicProcedure, router } from '../../trpc.js';
import {
  createUserInputSchema,
  createUserResponseSchema,
  getAllUsersResponseSchema,
  updateKycStatusInputSchema,
  updateKycStatusResponseSchema,
  upgradeRequestInputSchema,
  upgradeRequestResponseSchema,
} from '../../models/user.models.js';

//getAlluser,createuser,upgradeRequest,updateKycStatus

export const userRouter = router({
  getAllUser: publicProcedure
    .meta({ openapi: { method: 'GET', path: '/users', description: 'Get all users' } })
    .input(z.undefined())
    .output(getAllUsersResponseSchema)
    .query(async ({ ctx }) => {
      const users = await ctx.prisma.user.findMany({
        select: { id: true, email: true, name: true, phone: true, role: true, createdAt: true },
      });
      return { users };
    }),

  createUser: publicProcedure
    .meta({ openapi: { method: 'POST', path: '/users', description: 'Create a new user' } })
    .input(createUserInputSchema)
    .output(createUserResponseSchema)
    .mutation(async ({ ctx, input }) => {
      const user = await ctx.prisma.user.create({
        data: {
          id: input.id, // Clerk ID from frontend
          email: input.email,
          password: input.password,
          name: input.name ?? null,
          phone: input.phone ?? null,
          role: input.role ?? 'LEASER',
        },
      });
      return {
        id: user.id,
        email: user.email,
        name: user.name,
        phone: user.phone,
        role: user.role,
        createdAt: user.createdAt,
      };
    }),

  upgradeRequest: publicProcedure
    .meta({
      openapi: {
        method: 'POST',
        path: '/user/upgrade-request',
        description: 'Submit KYC (Citizenship, Photo) to become a Land Owner',
      },
    })
    .input(upgradeRequestInputSchema)
    .output(upgradeRequestResponseSchema)
    .mutation(async ({ ctx, input }) => {
      const kyc = await ctx.prisma.kycDetail.upsert({
        where: { userId: input.userId },
        create: {
          userId: input.userId,
          citizenshipNumber: input.citizenshipNumber,
          documentUrl: input.documentUrl,
          selfieUrl: input.selfieUrl ?? null,
        },
        update: {
          citizenshipNumber: input.citizenshipNumber,
          documentUrl: input.documentUrl,
          selfieUrl: input.selfieUrl ?? null,
          status: 'PENDING',
        },
      });
      return {
        id: kyc.id,
        userId: kyc.userId,
        status: kyc.status,
        citizenshipNumber: kyc.citizenshipNumber,
        documentUrl: kyc.documentUrl,
        selfieUrl: kyc.selfieUrl,
      };
    }),

  updateKycStatus: adminProcedure
    .meta({
      openapi: {
        method: 'PATCH',
        path: '/user/kyc/status',
        description: '(Admin Only) Approve/Reject land owner verification',
      },
    })
    .input(updateKycStatusInputSchema)
    .output(updateKycStatusResponseSchema)
    .mutation(async ({ ctx, input }) => {
      const kyc = await ctx.prisma.kycDetail.findUnique({
        where: { userId: input.userId },
        include: { user: true },
      });
      if (!kyc) {
        throw new TRPCError({ code: 'NOT_FOUND', message: 'KYC record not found for this user' });
      }

      await ctx.prisma.$transaction([
        ctx.prisma.kycDetail.update({
          where: { userId: input.userId },
          data: { status: input.status },
        }),
        ctx.prisma.user.update({
          where: { id: input.userId },
          data: {
            isKycVerified: input.status === 'APPROVED',
            role: input.status === 'APPROVED' ? 'OWNER' : kyc.user.role,
          },
        }),
      ]);

      const updatedUser = await ctx.prisma.user.findUniqueOrThrow({
        where: { id: input.userId },
        select: { role: true, isKycVerified: true },
      });

      return {
        userId: input.userId,
        kycStatus: input.status,
        userRole: updatedUser.role,
        isKycVerified: updatedUser.isKycVerified,
      };
    }),
});

