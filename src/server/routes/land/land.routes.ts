import { TRPCError } from '@trpc/server';
import { adminProcedure, leaserProcedure, ownerProcedure, publicProcedure, router } from '../../trpc.js';
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
import { calculateSqMtr } from '../../lib/converttosqmeter.js';
import z from 'zod';
export const landRouter = router({
  publish: publicProcedure
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
          sizeInSqmeter:totalSqmeter,
          pricePerMonth: input.price,
          heroImageUrl: input.landpic,
          galleryUrls: input.morelandpic,
          lalpurjaUrl: input.lalpurjaUrl ?? null,
          status:'UNVERIFIED',
        },
      });
    }),
    acceptLand: adminProcedure
    .input(z.object({ landId: z.string() }))
    .mutation(async ({ ctx, input }) => {
      return await ctx.prisma.land.update({
        where: { id: input.landId },
        data: { status: 'AVAILABLE' },
      });
    }),
    rejectLand: adminProcedure
    .input(z.object({ landId: z.string() }))
    .mutation(async ({ ctx, input }) => {
      return await ctx.prisma.land.update({
        where: { id: input.landId },
        data: { status: 'REJECTED' },
      });
    }),
    

  search: publicProcedure
    .input(searchLandInputSchema)
    .output(searchLandResponseSchema)
    .query(async ({ ctx, input }) => {
      console.log("Search Input:", input);
       //show the types of input fields      console.log("Input Types:", {
       
       console.log("location:", typeof input.location);
        console.log("minPrice:", typeof input.minPrice);
        console.log("maxSize:", typeof input.maxSize);
        console.log("minSize:", typeof input.minSize);

      const where: any = {
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
        where.sizeInSqFt = {
          ...(input.minSize !== undefined && { gte: input.minSize }),
          ...(input.maxSize !== undefined && { lte: input.maxSize }),
        };
      }
console.log("Constructed Where Clause:", where);
      const lands = await ctx.prisma.land.findMany({
        where,
        orderBy: { createdAt: 'desc' },
      });
console.log("Found Lands:", lands);
      return { lands };
    }),

  getById: publicProcedure
    .input(getLandByIdInputSchema)
    .output(landSchema)
    .query(async ({ ctx, input }) => {
      const land = await ctx.prisma.land.findUnique({
        where: { id: input.landId },
      });
      if (!land) throw new TRPCError({ code: 'NOT_FOUND', message: 'Land not found' });
      return land;
    }),
    

  updateStatus: adminProcedure
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
  .input(z.object({
    status: z.enum(['AVAILABLE', 'UNVERIFIED', 'REJECTED', 'IN_NEGOTIATION', 'LEASED', 'HIDDEN']).optional()
  }).optional()) // Make the whole input optional too
  .query(async ({ ctx, input }) => {
    try {
      // Build the filter safely
      const where: any = {};
      
      // Only apply status filter if it exists and isn't a "placeholder" string
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
    } catch (error) {
      console.error("Database Error in getAllLandsAdmin:", error);
      throw new TRPCError({
        code: 'INTERNAL_SERVER_ERROR',
        message: 'Failed to fetch lands for admin',
      });
    }
  }),
});