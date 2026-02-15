import { TRPCError } from '@trpc/server';
import { adminProcedure, leaserProcedure, ownerProcedure, publicProcedure, router } from '../../trpc.js';
import { getLandByIdInputSchema, landSchema, publishLandInputSchema, publishLandResponseSchema, searchLandInputSchema, searchLandResponseSchema, updateLandStatusInputSchema, updateLandStatusResponseSchema, } from '../../models/land.models.js';
import { calculateSqMtr } from '../../lib/converttosqmeter.js';
import z from 'zod';
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
        return await ctx.prisma.land.create({
            data: {
                ownerId: input.ownerId,
                title: input.title,
                description: input.description,
                location: input.location,
                sizeInSqmeter: totalSqmeter,
                pricePerMonth: input.price,
                heroImageUrl: input.landpic,
                galleryUrls: input.morelandpic,
                lalpurjaUrl: input.lalpurjaUrl ?? null,
                status: 'UNVERIFIED',
            },
        });
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
        .mutation(async ({ ctx, input }) => {
        return await ctx.prisma.land.update({
            where: { id: input.landId },
            data: { status: 'AVAILABLE' },
        });
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
        .mutation(async ({ ctx, input }) => {
        return await ctx.prisma.land.update({
            where: { id: input.landId },
            data: { status: 'REJECTED' },
        });
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
            status: 'AVAILABLE'
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
        return { id: updated.id, status: updated.status };
    }),
    getAllLandsAdmin: adminProcedure
        .meta({
        openapi: {
            method: 'GET',
            path: '/land/admin/all',
            tags: ['Land Admin'],
            summary: 'Get all lands with status filters for Admin',
        },
    })
        .input(z.object({
        status: z.enum(['AVAILABLE', 'UNVERIFIED', 'REJECTED', 'IN_NEGOTIATION', 'LEASED', 'HIDDEN']).optional()
    }).optional())
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
                        }
                    }
                }
            });
            return lands;
        }
        catch (error) {
            throw new TRPCError({
                code: 'INTERNAL_SERVER_ERROR',
                message: 'Failed to fetch lands for admin',
            });
        }
    }),
});
//# sourceMappingURL=land.routes.js.map