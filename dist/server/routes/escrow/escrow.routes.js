import { TRPCError } from '@trpc/server';
import { EscrowStatus } from '@prisma/client';
import { getEscrowByIdResponseSchema, getMyEscrowsResponseSchema, getMyOwnerEscrowsResponseSchema, payEscrowInputSchema, payEscrowResponseSchema, saveChatChannelInputSchema, saveChatChannelResponseSchema, verifyMalpotPapersInputSchema, verifyMalpotPapersResponseSchema, } from '../../models/escrow.models.js';
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
            description: 'Leaser-only endpoint to record an escrow payment for an ACCEPTED lease application. Validates that the application exists, belongs to the calling leaser, has ACCEPTED status, has no existing escrow record, and that the land is currently IN_NEGOTIATION. Creates an Escrow record in HOLDING status with the specified amount, payment ID, and platform commission. Sends a Web Push notification to the land owner confirming the deposit. Fires an escrow_paid PostHog event.',
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
        const escrow = await ctx.prisma.escrow.create({
            data: {
                applicationId: input.applicationId,
                ownerId: application.land.ownerId,
                leaserId: application.leaserId,
                amount: input.amount,
                paymentId: input.paymentId,
                commission: input.commission,
                status: 'HOLDING',
            },
        });
        posthog.capture({
            distinctId: ctx.user.id,
            event: 'escrow_paid',
            properties: {
                escrow_id: escrow.id,
                application_id: input.applicationId,
                amount: input.amount,
                commission: input.commission,
                land_id: application.landId,
                owner_id: application.land.ownerId,
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
                id: escrow.id,
                applicationId: escrow.applicationId,
                amount: escrow.amount,
                status: escrow.status,
            },
            landStatus: application.land.status,
        };
    }),
    VerifyMalpotPapers: adminProcedure
        .meta({
        openapi: {
            method: 'POST',
            path: '/lease/verify-malpot-papers',
            description: 'Admin-only endpoint to formally verify Malpot (land registry) papers and release escrow funds. Validates that the application and its escrow record exist and that the escrow is in HOLDING status. Atomically: upserts the LeaseAgreement record with the verified Malpot paper URL and admin approval timestamp, marks the application as COMPLETED, sets the land status to LEASED, and releases the escrow to RELEASED. Fires a malpot_verified PostHog event.',
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
        posthog.capture({
            distinctId: ctx.user.id,
            event: 'malpot_verified',
            properties: {
                application_id: input.applicationId,
                land_id: application.landId,
                escrow_id: application.escrow.id,
                escrow_amount: application.escrow.amount,
            },
        });
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
            description: 'Leaser-only endpoint to associate a Stream Chat channel ID with an escrow record. Called immediately after the leaser creates a new messaging channel so both parties can find and join the negotiation chat. Validates that the application exists, belongs to the calling leaser, and has an associated escrow record.',
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
            description: 'Leaser-only endpoint that returns all escrow records where the authenticated user is the leaser. Each escrow includes the linked application and land details (ID, title, location, hero image, status). Results are ordered newest-first. Used on the leaser dashboard to track the status of active and historical escrow payments.',
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
            description: 'Owner-only endpoint that returns all escrow records where the authenticated user is the landowner. Each escrow includes the linked application and land details (ID, title, location, hero image, status). Results are ordered newest-first. Used on the landowner dashboard to monitor incoming escrow deposits and track the progress of active lease negotiations.',
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
            description: 'Fetch the full details of a single escrow record by its ID. Accessible to the leaser, the landowner, or an admin associated with the escrow. Returns the escrow amount, payment ID, status, commission, Malpot paper URLs, and the linked application with land details. Throws FORBIDDEN if the requesting user is not a party to the escrow.',
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
            throw new TRPCError({ code: 'NOT_FOUND', message: 'Escrow record not found' });
        }
        const isLeaser = escrow.leaserId === ctx.user.id;
        const isOwner = escrow.ownerId === ctx.user.id;
        const isAdmin = ctx.user.role === 'ADMIN';
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
            description: 'Allows either the landowner or the leaser to upload their signed Malpot (land registry) agreement document. The uploaded URL is saved to the appropriate field on the escrow record: landownerMalpotUrl for the owner, landleaserMalpotUrl for the leaser. Both parties must upload before the admin can proceed with verification. Validates that the calling user is a party to the specified escrow. Fires a malpot_submitted PostHog event.',
        },
    })
        .input(z.object({
        escrowId: z.string(),
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
        const isOwner = escrow.ownerId === ctx.user.id;
        if (!isLeaser && !isOwner) {
            throw new TRPCError({ code: 'FORBIDDEN', message: 'Access denied. You are not a party to this transaction.' });
        }
        const updateData = isOwner
            ? { landownerMalpotUrl: input.malpotPaperUrl }
            : { landleaserMalpotUrl: input.malpotPaperUrl };
        await ctx.prisma.escrow.update({
            where: { id: input.escrowId },
            data: updateData,
        });
        posthog.capture({
            distinctId: ctx.user.id,
            event: 'malpot_submitted',
            properties: {
                escrow_id: input.escrowId,
                role: isOwner ? 'OWNER' : 'LEASER',
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
                    { landownerMalpotUrl: { not: null } },
                    { landownerMalpotUrl: { not: "" } },
                    { landleaserMalpotUrl: { not: null } },
                    { landleaserMalpotUrl: { not: "" } },
                ],
            },
            include: {
                owner: { select: { name: true } },
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
        action: z.enum(["APPROVE", "REJECT"]),
    }))
        .mutation(async ({ ctx, input }) => {
        const { escrowId, action } = input;
        if (action === "APPROVE") {
            const escrow = await ctx.prisma.escrow.findUnique({
                where: { id: escrowId },
                select: {
                    applicationId: true,
                    amount: true,
                    ownerId: true,
                    application: { select: { landId: true, leaserId: true } },
                },
            });
            if (!escrow || !escrow.applicationId) {
                throw new TRPCError({ code: "NOT_FOUND", message: "Escrow or linked application not found" });
            }
            const result = await ctx.prisma.$transaction([
                ctx.prisma.escrow.update({
                    where: { id: escrowId },
                    data: { status: "RELEASED" },
                }),
                ctx.prisma.application.update({
                    where: { id: escrow.applicationId },
                    data: { status: "COMPLETED" },
                }),
                ctx.prisma.land.update({
                    where: { id: escrow.application.landId },
                    data: { status: "LEASED" },
                }),
            ]);
            posthog.capture({
                distinctId: ctx.user.id,
                event: 'lease_completed',
                properties: {
                    escrow_id: escrowId,
                    application_id: escrow.applicationId,
                    land_id: escrow.application.landId,
                    escrow_amount: escrow.amount,
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
        }
        else {
            const result = await ctx.prisma.escrow.update({
                where: { id: escrowId },
                data: {
                    landownerMalpotUrl: null,
                    landleaserMalpotUrl: null,
                    status: "HOLDING",
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
            description: 'Admin-only endpoint that returns all escrow records where both the landowner and the leaser have uploaded their signed Malpot agreement documents (landownerMalpotUrl and landleaserMalpotUrl are both non-empty). Used on the admin verification dashboard to present the queue of leases ready for final approval or rejection. Includes owner and leaser names and full land details.',
        },
    })
        .output(z.any())
        .query(async ({ ctx }) => {
        const escrows = await ctx.prisma.escrow.findMany({
            where: {
                AND: [
                    { landownerMalpotUrl: { not: null } },
                    { landownerMalpotUrl: { not: "" } },
                    { landleaserMalpotUrl: { not: null } },
                    { landleaserMalpotUrl: { not: "" } },
                ],
            },
            include: {
                owner: { select: { name: true } },
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
//# sourceMappingURL=escrow.routes.js.map