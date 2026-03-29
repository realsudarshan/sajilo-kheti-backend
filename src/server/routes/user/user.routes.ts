import { clerkClient } from '@clerk/express';
import type { Prisma } from '@prisma/client';
import { TRPCError } from '@trpc/server';
import { z } from 'zod';
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
  clerkAuthedProcedure,
  router,
} from '../../trpc.js';
import { posthog } from '../../lib/analytics.js';
import { sendPushNotification } from '../../lib/push.js';

export const userRouter = router({
  getAllUser: adminProcedure
    .meta({
      openapi: {
        method: 'GET',
        path: '/users/all',
        tags: ['Users'],
        summary: 'Retrieve all registered users with Clerk-hydrated profile data',
        description: 'Admin-only endpoint that fetches every user record from the database and cross-references each with Clerk to attach the user\'s real name, primary email address, and profile image URL. Returns role, KYC verification status, and account creation timestamp alongside the Clerk data.',
      },
    })
    .output(getAllUsersResponseSchema)
    .query(async ({ ctx }) => {
      const users = await ctx.prisma.user.findMany({
        select: {
          id:            true,
          role:          true,
          isKycVerified: true,
          createdAt:     true,
        },
      });

      const clerkUsers = await clerkClient.users.getUserList({
        userId: users.map((u) => u.id),
      });

      const hydratedUsers = users.map((dbUser) => {
        const clerkInfo = clerkUsers.data.find((cu) => cu.id === dbUser.id);
        return {
          ...dbUser,
          email:    clerkInfo?.emailAddresses[0]?.emailAddress ?? 'No email',
          name:     `${clerkInfo?.firstName ?? ''} ${clerkInfo?.lastName ?? ''}`.trim() || 'Unnamed',
          imageUrl: clerkInfo?.imageUrl,
        };
      });

      return { users: hydratedUsers };
    }),

  createUser: publicProcedure
    .meta({
      openapi: {
        method: 'POST',
        path: '/users/create',
        tags: ['Users'],
        summary: 'Create or upsert a user record from a Clerk webhook event',
        description: 'Called by the Clerk webhook on user.created events. Uses an upsert so that repeated or late-arriving webhook deliveries are idempotent. New users are assigned the LEASER role by default. Also captures a user_created analytics event in PostHog.',
      },
    })
    .input(createUserInputSchema)
    .output(createUserResponseSchema)
    .mutation(async ({ ctx, input }) => {
      const user = await ctx.prisma.user.upsert({
        where:  { id: input.id },
        update: {},
        create: { id: input.id, role: 'LEASER' },
      });

      posthog.capture({
        distinctId: input.id,
        event: 'user_created',
        properties: {
          user_id: input.id,
          role:    'LEASER',
        },
      });

      return user;
    }),

  upgradeRequest: protectedProcedure
    .meta({
      openapi: {
        method: 'POST',
        path: '/users/upgrade-request',
        tags: ['KYC'],
        summary: 'Submit or re-submit a KYC verification request to become a Landowner',
        description: 'Allows an authenticated leaser to upload their citizenship document URL, selfie URL, citizenship number, and payment number in order to request a role upgrade from LEASER to OWNER. The record is upserted so users can correct and re-submit a rejected application. Status is always reset to PENDING on submission. Fires a kyc_submitted PostHog event.',
      },
    })
    .input(upgradeRequestInputSchema)
    .output(upgradeRequestResponseSchema)
    .mutation(async ({ ctx, input }) => {
      const kyc = await ctx.prisma.kycDetail.upsert({
        where:  { userId: ctx.user.id },
        create: {
          userId:            ctx.user.id,
          citizenshipNumber: input.citizenshipNumber,
          documentUrl:       input.documentUrl,
          selfieUrl:         input.selfieUrl ?? null,
          paymentNumber:     input.paymentNumber,
          status:            'PENDING',
        },
        update: {
          citizenshipNumber: input.citizenshipNumber,
          documentUrl:       input.documentUrl,
          selfieUrl:         input.selfieUrl ?? null,
          paymentNumber:     input.paymentNumber,
          status:            'PENDING',
        },
      });

      posthog.capture({
        distinctId: ctx.user.id,
        event: 'kyc_submitted',
        properties: {
          user_id: ctx.user.id,
        },
      });

      return kyc;
    }),

  updateKycStatus: adminProcedure
    .meta({
      openapi: {
        method: 'POST',
        path: '/users/update-kyc-status',
        tags: ['KYC'],
        summary: 'Admin: Approve or reject a pending KYC application and update the user role',
        description: 'Admin-only endpoint that atomically updates the KYC record status and the user\'s role and isKycVerified flag in a single database transaction. APPROVED promotes the user to OWNER role and sets isKycVerified=true. REJECTED keeps the user as LEASER and sets isKycVerified=false. Sends a Web Push notification to the user with the outcome and fires a kyc_reviewed PostHog event.',
      },
    })
    .input(updateKycStatusInputSchema)
    .output(updateKycStatusResponseSchema)
    .mutation(async ({ ctx, input }) => {
      const result = await ctx.prisma.$transaction(async (tx: Prisma.TransactionClient) => {
        const kyc = await tx.kycDetail.findUnique({
          where: { userId: input.userId },
        });

        if (!kyc) {
          throw new TRPCError({ code: 'NOT_FOUND', message: 'No KYC record' });
        }

        const updatedKyc = await tx.kycDetail.update({
          where: { userId: input.userId },
          data:  { status: input.status },
        });

        const updatedUser = await tx.user.update({
          where: { id: input.userId },
          data: {
            isKycVerified: input.status === 'APPROVED',
            role:          input.status === 'APPROVED' ? 'OWNER' : 'LEASER',
          },
        });

        return {
          userId:        updatedUser.id,
          kycStatus:     updatedKyc.status,
          userRole:      updatedUser.role,
          isKycVerified: updatedUser.isKycVerified,
        };
      });

      posthog.capture({
        distinctId: input.userId,
        event: 'kyc_reviewed',
        properties: {
          user_id:   input.userId,
          status:    input.status,
          new_role:  input.status === 'APPROVED' ? 'OWNER' : 'LEASER',
          admin_id:  ctx.user.id,
        },
      });

      // Notify the user about their KYC result
      await sendPushNotification(input.userId, {
        title: input.status === 'APPROVED' ? 'KYC Verified! 🎉' : 'KYC Rejected ❌',
        body: input.status === 'APPROVED' 
          ? 'Your KYC documents have been verified. You can now list properties as a Landowner!'
          : 'Your KYC documents were rejected. Please review our guidelines and re-submit.',
        url: `/dashboard/profile`
      });

      return result;
    }),

  getKycDetails: protectedProcedure
    .meta({
      openapi: {
        method: 'GET',
        path: '/users/kyc-details',
        tags: ['KYC'],
        summary: 'Fetch the KYC record for the currently authenticated user',
        description: 'Returns the full KYC detail record (citizenship number, document URL, selfie URL, payment number, and review status) for the logged-in user. Returns null if no KYC application has been submitted yet. Used by the frontend to show current verification status and pre-fill re-submission forms.',
      },
    })
    .output(z.any())
    .query(async ({ ctx }) => {
      const kyc = await ctx.prisma.kycDetail.findUnique({
        where: { userId: ctx.user.id },
      });

      if (!kyc) return null;

      return kyc;
    }),

  getAllKycDetails: adminProcedure
    .meta({
      openapi: {
        method: 'GET',
        path: '/users/all-kyc',
        tags: ['KYC'],
        summary: 'Admin: List all KYC applications hydrated with Clerk user profile data',
        description: 'Admin-only endpoint that retrieves every KYC detail record from the database and enriches each entry with the applicant\'s real name and email from Clerk. Used on the admin KYC review dashboard to display pending, approved, and rejected applications in one list.',
      },
    })
    .output(z.any())
    .query(async ({ ctx }) => {
      const kycDetails = await ctx.prisma.kycDetail.findMany({
        include: {
          user: {
            select: {
              id:            true,
              role:          true,
              isKycVerified: true,
            },
          },
        },
      });

      const userIds = kycDetails.map((kyc) => kyc.userId);
      const clerkUsers = await clerkClient.users.getUserList({ userId: userIds });

      const hydratedKycDetails = kycDetails.map((kyc) => {
        const clerkInfo = clerkUsers.data.find((cu) => cu.id === kyc.userId);
        return {
          ...kyc,
          userName:  `${clerkInfo?.firstName ?? ''} ${clerkInfo?.lastName ?? ''}`.trim() || 'Unnamed',
          userEmail: clerkInfo?.emailAddresses[0]?.emailAddress ?? 'No email',
        };
      });

      return { kycDetails: hydratedKycDetails };
    }),

  getMe: clerkAuthedProcedure
    .meta({
      openapi: {
        method: 'GET',
        path: '/users/me',
        tags: ['Users'],
        summary: 'Fetch the complete profile of the currently authenticated user including lands and applications',
        description: 'Returns the full user record including their KYC details, owned land listings, and all submitted lease applications. If the user exists in Clerk but not yet in the database (webhook race condition), the record is auto-created with the LEASER role before returning. This is the primary bootstrap call made on every page load.',
      },
    })
    .output(z.any())
    .query(async ({ ctx }) => {
      let user = await ctx.prisma.user.findUnique({
        where:   { id: ctx.userId },
        include: {
          kycDetails:   true,
          lands:        true,
          applications: true,
        },
      });

      if (!user) {
        // Auto-create to handle Clerk webhook race conditions (webhooks can be delayed)
        user = await ctx.prisma.user.upsert({
          where:  { id: ctx.userId },
          update: {},
          create: { id: ctx.userId, role: 'LEASER' },
          include: {
            kycDetails:   true,
            lands:        true,
            applications: true,
          },
        });
      }

      return user;
    }),
});