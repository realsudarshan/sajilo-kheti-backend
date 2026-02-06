import { TRPCError } from '@trpc/server';
import z from 'zod';
import { adminProcedure, protectedProcedure, publicProcedure, router, } from '../../trpc.js';
import { createUserInputSchema, createUserResponseSchema, getAllUsersResponseSchema, updateKycStatusInputSchema, updateKycStatusResponseSchema, upgradeRequestInputSchema, upgradeRequestResponseSchema, } from '../../models/user.models.js';
export const userRouter = router({
    /**
     * GET ALL USERS
     * Restricted to Admin only for privacy.
     */
    getAllUser: adminProcedure
        .meta({
        openapi: {
            method: 'GET',
            path: '/users',
            description: 'Get all registered users (Admin only)',
        },
    })
        .input(z.void())
        .output(getAllUsersResponseSchema)
        .query(async ({ ctx }) => {
        const users = await ctx.prisma.user.findMany({
            select: {
                id: true, // This is your Clerk ID
                email: true,
                name: true,
                phone: true,
                role: true,
                isKycVerified: true,
                createdAt: true,
            },
        });
        return { users };
    }),
    /**
     * CREATE / SYNC USER
     * Usually called via a Clerk Webhook or the first time a user logs in.
     */
    createUser: publicProcedure
        .meta({
        openapi: {
            method: 'POST',
            path: '/users',
            description: 'Sync Clerk user with MongoDB',
        },
    })
        .input(createUserInputSchema)
        .output(createUserResponseSchema)
        .mutation(async ({ ctx, input }) => {
        const user = await ctx.prisma.user.create({
            data: {
                id: input.id, // Using the Clerk ID string as the MongoDB _id
                email: input.email,
                name: input.name ?? null,
                phone: input.phone ?? null,
                role: 'LEASER', // Default role for new signups
            },
        });
        return user;
    }),
    /**
     * UPGRADE REQUEST (KYC SUBMISSION)
     * Only the logged-in user can submit for themselves.
     */
    upgradeRequest: protectedProcedure
        .meta({
        openapi: {
            method: 'POST',
            path: '/user/upgrade-request',
            description: 'Submit KYC details to request Land Owner status',
        },
    })
        .input(upgradeRequestInputSchema.omit({ userId: true })) // We use ctx.userId for security
        .output(upgradeRequestResponseSchema)
        .mutation(async ({ ctx, input }) => {
        // ctx.user is guaranteed non-null here by protectedProcedure
        const kyc = await ctx.prisma.kycDetail.upsert({
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
                status: 'PENDING', // Reset to pending if they re-upload
            },
        });
        return kyc;
    }),
    /**
     * UPDATE KYC STATUS
     * Admin reviews the Lalpurja/Citizenship and upgrades the user.
     */
    updateKycStatus: adminProcedure
        .meta({
        openapi: {
            method: 'PATCH',
            path: '/user/kyc/status',
            description: 'Approve or Reject KYC. Approving upgrades role to OWNER.',
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
            throw new TRPCError({
                code: 'NOT_FOUND',
                message: 'No KYC submission found for this user',
            });
        }
        // Execute as a transaction so both records update or neither does
        const [updatedKyc, updatedUser] = await ctx.prisma.$transaction([
            ctx.prisma.kycDetail.update({
                where: { userId: input.userId },
                data: { status: input.status },
            }),
            ctx.prisma.user.update({
                where: { id: input.userId },
                data: {
                    isKycVerified: input.status === 'APPROVED',
                    // If approved, they become an OWNER. If rejected/pending, keep current role.
                    role: input.status === 'APPROVED' ? 'OWNER' : kyc.user.role,
                },
            }),
        ]);
        return {
            userId: updatedUser.id,
            kycStatus: updatedKyc.status,
            userRole: updatedUser.role,
            isKycVerified: updatedUser.isKycVerified,
        };
    }),
});
//# sourceMappingURL=user.routes.js.map