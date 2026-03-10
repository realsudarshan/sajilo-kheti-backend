// BACKEND: src/server/routes/escrow/escrow.routes.ts
// Full replacement — PayEscrow now delegates to payEscrowService
import { TRPCError } from '@trpc/server';
import { EscrowStatus } from '@prisma/client';
import { getEscrowByIdResponseSchema, getMyEscrowsResponseSchema, getMyOwnerEscrowsResponseSchema, payEscrowInputSchema, payEscrowResponseSchema, saveChatChannelInputSchema, saveChatChannelResponseSchema, verifyMalpotPapersInputSchema, verifyMalpotPapersResponseSchema, } from '../../models/escrow.models.js';
import { adminProcedure, leaserProcedure, ownerProcedure, protectedProcedure, router } from '../../trpc.js';
import { payEscrowService } from '../../services/escrow.service.js';
import z from 'zod';
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
            where: { id: input.applicationId },
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
                ownerId: application.land.ownerId, // ← land owner
                leaserId: application.leaserId, // ← leaser who applied
                amount: input.amount,
                paymentId: input.paymentId,
                commission: input.commission,
                status: 'HOLDING',
            },
        });
        return {
            success: true,
            message: 'Escrow payment successful. You can now arrange to meet at Malpot Karyalaya.',
            escrow: {
                id: escrow.id,
                applicationId: escrow.applicationId,
                amount: escrow.amount,
                status: escrow.status,
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
            where: { id: input.applicationId },
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
                code: 'BAD_REQUEST',
                message: 'Escrow payment must be HELD before verification',
            });
        }
        const results = await ctx.prisma.$transaction([
            ctx.prisma.leaseAgreement.upsert({
                where: { applicationId: input.applicationId },
                create: { applicationId: input.applicationId, malpotPaperUrl: input.malpotPaperUrl, adminVerified: true, verifiedAt: new Date() },
                update: { malpotPaperUrl: input.malpotPaperUrl, adminVerified: true, verifiedAt: new Date() },
            }),
            ctx.prisma.application.update({ where: { id: input.applicationId }, data: { status: 'COMPLETED' } }),
            ctx.prisma.land.update({ where: { id: application.landId }, data: { status: 'LEASED' } }),
            ctx.prisma.escrow.update({ where: { id: application.escrow.id }, data: { status: 'RELEASED' } }),
        ]);
        return {
            success: true,
            message: 'Malpot papers verified. Funds released to owner.',
            application: { id: results[1].id, status: results[1].status },
            landStatus: results[2].status,
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
            where: { id: input.applicationId },
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
            data: { chatChannelId: input.chatChannelId },
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
            where: { leaserId: ctx.user.id },
            include: {
                application: {
                    include: {
                        land: {
                            select: {
                                id: true,
                                title: true,
                                location: true,
                                heroImageUrl: true,
                                status: true,
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
            where: { ownerId: ctx.user.id },
            include: {
                application: {
                    include: {
                        land: {
                            select: {
                                id: true,
                                title: true,
                                location: true,
                                heroImageUrl: true,
                                status: true,
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
                                id: true,
                                title: true,
                                location: true,
                                heroImageUrl: true,
                            },
                        },
                    },
                },
            },
        });
        if (!escrow) {
            throw new TRPCError({
                code: 'NOT_FOUND',
                message: 'Escrow record not found'
            });
        }
        // --- THE FIX IS HERE ---
        // Check if the current user is the Leaser OR the Landowner
        const isLeaser = escrow.leaserId === ctx.user.id;
        const isOwner = escrow.ownerId === ctx.user.id;
        const isAdmin = ctx.user.role === 'ADMIN'; // Add this if you have roles
        if (!isLeaser && !isOwner && !isAdmin) {
            throw new TRPCError({
                code: 'FORBIDDEN',
                message: 'You do not have permission to view this escrow'
            });
        }
        return escrow;
    }),
    /**
   * SUBMIT MALPOT PAPERS
   * Targets Escrow by ID and identifies the uploader role.
   */
    SubmitMalpotPapers: protectedProcedure
        .meta({
        openapi: {
            method: 'POST',
            path: '/lease/submit-malpot-papers',
            description: 'Submit the signed Malpot agreement (Owner or Leaser).',
        },
    })
        .input(z.object({
        escrowId: z.string(),
        malpotPaperUrl: z.string().url(),
    }))
        .output(z.object({ success: z.boolean(), message: z.string() }))
        .mutation(async ({ ctx, input }) => {
        // 1. Fetch the Escrow record to verify participants
        const escrow = await ctx.prisma.escrow.findUnique({
            where: { id: input.escrowId },
        });
        if (!escrow) {
            throw new TRPCError({ code: 'NOT_FOUND', message: 'Escrow record not found' });
        }
        // 2. Identify the role of the logged-in user
        const isLeaser = escrow.leaserId === ctx.user.id;
        const isOwner = escrow.ownerId === ctx.user.id;
        if (!isLeaser && !isOwner) {
            throw new TRPCError({
                code: 'FORBIDDEN',
                message: 'Access denied. You are not a party to this transaction.'
            });
        }
        // 3. Prepare the update data for the specific role field
        const updateData = isOwner
            ? { landownerMalpotUrl: input.malpotPaperUrl }
            : { landleaserMalpotUrl: input.malpotPaperUrl };
        // 4. Update the Escrow record
        await ctx.prisma.escrow.update({
            where: { id: input.escrowId },
            data: updateData,
        });
        return {
            success: true,
            message: `Document successfully uploaded as ${isOwner ? 'Landowner' : 'Leaser'}.`,
        };
    }),
    GetAllEscrowsForAdmin: adminProcedure.query(async ({ ctx }) => {
        return await ctx.prisma.escrow.findMany({
            where: {
                AND: [
                    { landownerMalpotUrl: { not: null } },
                    { landownerMalpotUrl: { not: "" } }, // Separate objects to avoid duplicate 'not' keys
                    { landleaserMalpotUrl: { not: null } },
                    { landleaserMalpotUrl: { not: "" } },
                ],
            },
            include: {
                owner: { select: { name: true } },
                leaser: { select: { name: true } },
                application: {
                    include: {
                        land: { select: { title: true, location: true } }
                    },
                },
            },
            orderBy: { updatedAt: "desc" },
        });
    }),
    VerifyLegalDocuments: adminProcedure
        .input(z.object({
        escrowId: z.string(),
        action: z.enum(["APPROVE", "REJECT"])
    }))
        .mutation(async ({ ctx, input }) => {
        // FIX 1: Removed 'input.input' typo. It's just 'input'
        const { escrowId, action } = input;
        if (action === "APPROVE") {
            const escrow = await ctx.prisma.escrow.findUnique({
                where: { id: escrowId },
                select: { applicationId: true }
            });
            // FIX 2: Strict ID check. Prisma won't accept 'undefined' for a unique find.
            if (!escrow || !escrow.applicationId) {
                throw new TRPCError({
                    code: "NOT_FOUND",
                    message: "Escrow or linked application not found"
                });
            }
            return await ctx.prisma.$transaction([
                ctx.prisma.escrow.update({
                    where: { id: escrowId },
                    data: { status: "RELEASED" },
                }),
                ctx.prisma.application.update({
                    where: { id: escrow.applicationId }, // Now guaranteed to be a string
                    data: { status: "COMPLETED" }
                })
            ]);
        }
        else {
            return await ctx.prisma.escrow.update({
                where: { id: escrowId },
                data: {
                    landownerMalpotUrl: null,
                    landleaserMalpotUrl: null,
                    status: "HOLDING"
                },
            });
        }
    }),
});
//# sourceMappingURL=escrow.routes.js.map