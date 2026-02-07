import { TRPCError } from '@trpc/server';
import { publicProcedure, router } from '../../trpc.js';
import {
  getLandByIdInputSchema,
  landSchema,
  publishLandInputSchema,
  publishLandResponseSchema,
  searchLandInputSchema,
  searchLandResponseSchema,
  updateLandStatusInputSchema,
  updateLandStatusResponseSchema,
} from '../../models/land.models.js';
import { convertToSqMeter } from '../../lib/converttosqmeter.js';

export const landRouter = router({
  publish: publicProcedure
    .meta({
      openapi: {
        method: 'POST',
        path: '/land/publish',
        description: 'Create a land listing',
      },
    })
    .input(publishLandInputSchema)
    .output(publishLandResponseSchema)
    .mutation(async ({ ctx, input }) => {
      const sqMeterSize = convertToSqMeter(input.size.size, input.size.unit);
      const land = await ctx.prisma.land.create({
        data: {
          ownerId: input.ownerId,
          title: input.title,
          description: input.description,
          location: input.location,
          sizeInSqFt: sqMeterSize,
          pricePerMonth: input.price,
          heroImageUrl: input.landpic,
          galleryUrls: input.morelandpic ?? [],
          lalpurjaUrl: input.lalpurjaUrl ?? null,
          status: 'AVAILABLE',
        },
      });

      return {
        id: land.id,
        ownerId: land.ownerId,
        title: land.title,
        description: land.description,
        location: land.location,
        area: land.area,
        sizeInSqFt: land.sizeInSqFt,
        pricePerMonth: land.pricePerMonth,
        heroImageUrl: land.heroImageUrl,
        galleryUrls: land.galleryUrls,
        lalpurjaUrl: land.lalpurjaUrl,
        status: land.status,
        createdAt: land.createdAt,
        updatedAt: land.updatedAt,
      };
    }),

  search: publicProcedure
    .meta({
      openapi: {
        method: 'GET',
        path: '/land/search',
        description: 'Filter land by location, price, or size',
      },
    })
    .input(searchLandInputSchema)
    .output(searchLandResponseSchema)
    .query(async ({ ctx, input }) => {
      const where: any = {};

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
        where.sizeInSqFt = {
          ...(input.minSize !== undefined && { gte: input.minSize }),
          ...(input.maxSize !== undefined && { lte: input.maxSize }),
        };
      }

      const lands = await ctx.prisma.land.findMany({
        where,
        orderBy: { createdAt: 'desc' },
      });

      return {
        lands: lands.map((l) => ({
          id: l.id,
          ownerId: l.ownerId,
          title: l.title,
          description: l.description,
          location: l.location,
          area: l.area,
          sizeInSqFt: l.sizeInSqFt,
          pricePerMonth: l.pricePerMonth,
          heroImageUrl: l.heroImageUrl,
          galleryUrls: l.galleryUrls,
          lalpurjaUrl: l.lalpurjaUrl,
          status: l.status,
          createdAt: l.createdAt,
          updatedAt: l.updatedAt,
        })),
      };
    }),

  getById: publicProcedure
    .meta({
      openapi: {
        method: 'GET',
        path: '/land/{landId}',
        description: 'View full details of a specific plot',
      },
    })
    .input(getLandByIdInputSchema)
    .output(landSchema)
    .query(async ({ ctx, input }) => {
      const land = await ctx.prisma.land.findUnique({
        where: { id: input.landId },
      });
      if (!land) {
        throw new TRPCError({ code: 'NOT_FOUND', message: 'Land not found' });
      }
      return {
        id: land.id,
        ownerId: land.ownerId,
        title: land.title,
        description: land.description,
        location: land.location,
        area: land.area,
        sizeInSqFt: land.sizeInSqFt,
        pricePerMonth: land.pricePerMonth,
        heroImageUrl: land.heroImageUrl,
        galleryUrls: land.galleryUrls,
        lalpurjaUrl: land.lalpurjaUrl,
        status: land.status,
        createdAt: land.createdAt,
        updatedAt: land.updatedAt,
      };
    }),

  updateStatus: publicProcedure
    .meta({
      openapi: {
        method: 'PUT',
        path: '/land/{landId}/status',
        description: 'Mark land as Leased, Hidden, or Available',
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
});