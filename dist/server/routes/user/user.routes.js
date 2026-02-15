import { clerkClient } from '@clerk/express';
import { TRPCError } from '@trpc/server';
import { createUserInputSchema, createUserResponseSchema, getAllUsersResponseSchema, updateKycStatusInputSchema, updateKycStatusResponseSchema, upgradeRequestInputSchema, upgradeRequestResponseSchema, } from '../../models/user.models.js';
import { adminProcedure, protectedProcedure, publicProcedure, router, } from '../../trpc.js';
export const userRouter = router({
    getAllUser: adminProcedure
        .meta({
        openapi: {
            method: 'GET',
            path: '/users/all',
            tags: ['Users'],
            summary: 'Get all users with hydrated Clerk data',
        },
    })
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
                email: clerkInfo?.emailAddresses[0]?.emailAddress ?? 'No email',
                name: `${clerkInfo?.firstName ?? ''} ${clerkInfo?.lastName ?? ''}`.trim() || 'Unnamed',
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
            summary: 'Create or upsert a new user',
        },
    })
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
        .meta({
        openapi: {
            method: 'POST',
            path: '/users/upgrade-request',
            tags: ['KYC'],
            summary: 'Submit a KYC upgrade request',
        },
    })
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
        .meta({
        openapi: {
            method: 'POST',
            path: '/users/update-kyc-status',
            tags: ['KYC'],
            summary: 'Approve or Reject KYC status (Admin)',
        },
    })
        .input(updateKycStatusInputSchema)
        .output(updateKycStatusResponseSchema)
        .mutation(async ({ ctx, input }) => {
        return await ctx.prisma.$transaction(async (tx) => {
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
        .meta({
        openapi: {
            method: 'GET',
            path: '/users/kyc-details',
            tags: ['KYC'],
            summary: 'Get current user KYC details',
        },
    })
        .query(async ({ ctx }) => {
        const kyc = await ctx.prisma.kycDetail.findUnique({
            where: { userId: ctx.user.id },
        });
        if (!kyc) {
            return null;
        }
        return kyc;
    }),
    getAllKycDetails: adminProcedure
        .meta({
        openapi: {
            method: 'GET',
            path: '/users/all-kyc',
            tags: ['KYC'],
            summary: 'Get all KYC applications (Admin)',
        },
    })
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
    getMe: protectedProcedure
        .meta({
        openapi: {
            method: 'GET',
            path: '/users/me',
            tags: ['Users'],
            summary: 'Get full profile of the logged-in user',
        },
    })
        .query(async ({ ctx }) => {
        const user = await ctx.prisma.user.findUnique({
            where: { id: ctx.user.id },
            include: {
                kycDetails: true,
                lands: true,
                applications: true,
            },
        });
        if (!user) {
            throw new TRPCError({
                code: 'NOT_FOUND',
                message: 'User profile not found in MongoDB.',
            });
        }
        return user;
    }),
});
//# sourceMappingURL=user.routes.js.map