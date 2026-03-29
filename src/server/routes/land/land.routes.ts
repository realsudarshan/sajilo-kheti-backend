import { TRPCError } from '@trpc/server';
import { adminProcedure, leaserProcedure, ownerProcedure, protectedProcedure, publicProcedure, router } from '../../trpc.js';
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
import { posthog } from '../../lib/analytics.js';

export const landRouter = router({
  publish: publicProcedure
    .meta({
      openapi: {
        method: 'POST',
        path: '/land/publish',
        tags: ['Land'],
        summary: 'Create a new land listing submitted by a landowner for admin verification',
        description: 'Allows a landowner to submit a new land listing with title, description, location, GPS coordinates, size (auto-converted to square metres), monthly asking price, hero image, gallery images, and Lalpurja document URL. The listing is created with UNVERIFIED status and will not appear in public search results until an admin approves it. Fires a land_published PostHog event.',
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
        summary: 'Admin: Approve an UNVERIFIED land listing and make it publicly available',
        description: 'Admin-only endpoint that transitions a land listing from UNVERIFIED to AVAILABLE status, making it visible in public search results and eligible to receive lease applications. Fires a land_verified PostHog event.',
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
        summary: 'Admin: Reject a land listing due to invalid or insufficient documentation',
        description: 'Admin-only endpoint that sets a land listing status to REJECTED, removing it from public search results. Used when the submitted Lalpurja document or land details do not meet verification requirements. The owner must re-submit with corrected information. Fires a land_rejected PostHog event.',
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
        summary: 'Search publicly available land listings with optional filters',
        description: 'Public endpoint that returns all land listings with AVAILABLE status. Supports optional filtering by location (case-insensitive partial match), minimum and maximum monthly price range, and minimum and maximum land size in square metres. Results are ordered newest-first. Fires a land_searched PostHog analytics event including the filter parameters and result count.',
      },
    })
    .input(searchLandInputSchema)
    .output(searchLandResponseSchema)
    .query(async ({ ctx, input }) => {
      const where: any = {
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
        summary: 'Fetch full details of a single land listing by its ID',
        description: 'Public endpoint that returns the complete land record for a given land ID, including all fields such as gallery images, GPS coordinates, Lalpurja URL, and current status. Throws NOT_FOUND if the land does not exist. Fires a land_viewed PostHog event recording the land ID, location, price, and status.',
      },
    })
    .input(getLandByIdInputSchema)
    .output(landSchema)
    .query(async ({ ctx, input }) => {
      const land = await ctx.prisma.land.findUnique({
        where: { id: input.landId },
      });

      if (!land) throw new TRPCError({ code: 'NOT_FOUND', message: 'Land not found' });

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
        summary: 'Admin: Manually override the status of any land listing',
        description: 'Admin-only escape hatch that directly sets a land listing to any valid status (AVAILABLE, UNVERIFIED, REJECTED, IN_NEGOTIATION, LEASED, HIDDEN). Intended for manual corrections and edge-case overrides; most status transitions happen automatically through the lease and escrow workflows. Fires a land_status_updated PostHog event.',
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
        summary: 'Admin: List every land listing in the system with owner info, filterable by status',
        description: 'Admin-only endpoint that returns all land listings across all owners, including the owner\'s ID and name. Supports an optional status filter to narrow results to a specific lifecycle stage (e.g. UNVERIFIED for the approval queue, LEASED for active leases). Results are ordered newest-first.',
      },
    })
    .input(z.object({
      status: z.enum(['AVAILABLE', 'UNVERIFIED', 'REJECTED', 'IN_NEGOTIATION', 'LEASED', 'HIDDEN']).optional(),
    }).optional())
    .output(z.any())
    .query(async ({ ctx, input }) => {
      try {
        const where: any = {};
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
      } catch (error) {
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
        summary: 'Fetch all land listings belonging to the authenticated user',
        description: 'Returns all land listings where the ownerId matches the authenticated user. Supports an optional status filter to view only listings in a specific state (e.g. UNVERIFIED pending review, AVAILABLE currently listed, LEASED actively leased). Used on the landowner dashboard to manage their portfolio. Results are ordered newest-first.',
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