import { TRPCError } from '@trpc/server';
import { adminProcedure, leaserProcedure, ownerProcedure, protectedProcedure, publicProcedure, router } from '../../trpc.js';
import { getLandByIdInputSchema, landSchema, publishLandInputSchema, publishLandResponseSchema, searchLandInputSchema, searchLandResponseSchema, updateLandStatusInputSchema, updateLandStatusResponseSchema, } from '../../models/land.models.js';
import { calculateSqMtr } from '../../lib/converttosqmeter.js';
import z from 'zod';
import { posthog } from '../../lib/analytics.js';
export const landRouter = router({
    publish: publicProcedure
        .meta({
        openapi: {
            method: 'POST',
            path: '/land/publish',
            tags: ['Land'],
            summary: 'Publish a new land listing',
        },
    })
        .input(publishLandInputSchema)
        .output(publishLandResponseSchema)
        .mutation(async ({ ctx, input }) => {
        const totalSqmeter = calculateSqMtr(input.size);
        const land = await ctx.prisma.land.create({
            data: {
                ownerId: input.ownerId,
                title: input.title,
                description: input.description,
                location: input.location,
                latitude: input.coordinates.lat,
                longitude: input.coordinates.lng,
                sizeInSqmeter: totalSqmeter,
                pricePerMonth: input.price,
                heroImageUrl: input.landpic,
                galleryUrls: input.morelandpic,
                lalpurjaUrl: input.lalpurjaUrl ?? null,
                status: 'UNVERIFIED',
            },
        });
        posthog.capture({
            distinctId: input.ownerId,
            event: 'land_published',
            properties: {
                land_id: land.id,
                location: land.location,
                price_per_month: land.pricePerMonth,
                size_in_sqmeter: land.sizeInSqmeter,
            },
        });
        return land;
    }),
    acceptLand: adminProcedure
        .meta({
        openapi: {
            method: 'POST',
            path: '/land/accept',
            tags: ['Land Admin'],
            summary: 'Accept and verify a land listing',
        },
    })
        .input(z.object({ landId: z.string() }))
        .output(z.any())
        .mutation(async ({ ctx, input }) => {
        const land = await ctx.prisma.land.update({
            where: { id: input.landId },
            data: { status: 'AVAILABLE' },
        });
        posthog.capture({
            distinctId: ctx.user.id,
            event: 'land_verified',
            properties: {
                land_id: input.landId,
                owner_id: land.ownerId,
            },
        });
        return land;
    }),
    rejectLand: adminProcedure
        .meta({
        openapi: {
            method: 'POST',
            path: '/land/reject',
            tags: ['Land Admin'],
            summary: 'Reject a land listing',
        },
    })
        .input(z.object({ landId: z.string() }))
        .output(z.any())
        .mutation(async ({ ctx, input }) => {
        const land = await ctx.prisma.land.update({
            where: { id: input.landId },
            data: { status: 'REJECTED' },
        });
        posthog.capture({
            distinctId: ctx.user.id,
            event: 'land_rejected',
            properties: {
                land_id: input.landId,
                owner_id: land.ownerId,
            },
        });
        return land;
    }),
    search: publicProcedure
        .meta({
        openapi: {
            method: 'GET',
            path: '/land/search',
            tags: ['Land'],
            summary: 'Search for available lands',
        },
    })
        .input(searchLandInputSchema)
        .output(searchLandResponseSchema)
        .query(async ({ ctx, input }) => {
        const where = {
            status: 'AVAILABLE',
        };
        if (input.location) {
            where.location = { contains: input.location, mode: 'insensitive' };
        }
        if (input.minPrice !== undefined || input.maxPrice !== undefined) {
            where.pricePerMonth = {
                ...(input.minPrice !== undefined && { gte: input.minPrice }),
                ...(input.maxPrice !== undefined && { lte: input.maxPrice }),
            };
        }
        if (input.minSize !== undefined || input.maxSize !== undefined) {
            where.sizeInSqmeter = {
                ...(input.minSize !== undefined && { gte: input.minSize }),
                ...(input.maxSize !== undefined && { lte: input.maxSize }),
            };
        }
        const lands = await ctx.prisma.land.findMany({
            where,
            orderBy: { createdAt: 'desc' },
        });
        posthog.capture({
            distinctId: ctx.userId ?? 'anonymous',
            event: 'land_searched',
            properties: {
                location: input.location,
                min_price: input.minPrice,
                max_price: input.maxPrice,
                min_size: input.minSize,
                max_size: input.maxSize,
                results_count: lands.length,
            },
        });
        return { lands };
    }),
    getById: publicProcedure
        .meta({
        openapi: {
            method: 'GET',
            path: '/land/{landId}',
            tags: ['Land'],
            summary: 'Get land details by ID',
        },
    })
        .input(getLandByIdInputSchema)
        .output(landSchema)
        .query(async ({ ctx, input }) => {
        const land = await ctx.prisma.land.findUnique({
            where: { id: input.landId },
        });
        if (!land)
            throw new TRPCError({ code: 'NOT_FOUND', message: 'Land not found' });
        posthog.capture({
            distinctId: ctx.userId ?? 'anonymous',
            event: 'land_viewed',
            properties: {
                land_id: land.id,
                location: land.location,
                price_per_month: land.pricePerMonth,
                status: land.status,
            },
        });
        return land;
    }),
    updateStatus: adminProcedure
        .meta({
        openapi: {
            method: 'POST',
            path: '/land/update-status',
            tags: ['Land Admin'],
            summary: 'Manually update land status',
        },
    })
        .input(updateLandStatusInputSchema)
        .output(updateLandStatusResponseSchema)
        .mutation(async ({ ctx, input }) => {
        const updated = await ctx.prisma.land.update({
            where: { id: input.landId },
            data: { status: input.status },
        });
        posthog.capture({
            distinctId: ctx.user.id,
            event: 'land_status_updated',
            properties: {
                land_id: input.landId,
                new_status: input.status,
            },
        });
        return { id: updated.id, status: updated.status };
    }),
    getAllLandsAdmin: adminProcedure
        .meta({
        openapi: {
            method: 'GET',
            path: '/land/admin/all',
            tags: ['Land Admin'],
            summary: 'Get all lands for Admin with optional status filter',
        },
    })
        .input(z.object({
        status: z.enum(['AVAILABLE', 'UNVERIFIED', 'REJECTED', 'IN_NEGOTIATION', 'LEASED', 'HIDDEN']).optional(),
    }).optional())
        .output(z.any())
        .query(async ({ ctx, input }) => {
        try {
            const where = {};
            if (input?.status) {
                where.status = input.status;
            }
            const lands = await ctx.prisma.land.findMany({
                where,
                orderBy: { createdAt: 'desc' },
                include: {
                    owner: {
                        select: {
                            id: true,
                            name: true,
                        },
                    },
                },
            });
            return lands;
        }
        catch (error) {
            console.error("Database Error in getAllLandsAdmin:", error);
            throw new TRPCError({
                code: 'INTERNAL_SERVER_ERROR',
                message: 'Failed to fetch lands for admin',
            });
        }
    }),
    getMyLands: protectedProcedure
        .meta({
        openapi: {
            method: 'GET',
            path: '/land/my-lands',
            tags: ['Land'],
            summary: 'Get all lands owned by the logged-in user',
        },
    })
        .input(z.object({
        status: z.enum(['AVAILABLE', 'UNVERIFIED', 'REJECTED', 'IN_NEGOTIATION', 'LEASED', 'HIDDEN']).optional(),
    }))
        .output(z.any())
        .query(async ({ ctx, input }) => {
        const lands = await ctx.prisma.land.findMany({
            where: {
                ownerId: ctx.user.id,
                ...(input.status && { status: input.status }),
            },
            orderBy: { createdAt: 'desc' },
        });
        return { lands };
    }),
});
//# sourceMappingURL=land.routes.js.map