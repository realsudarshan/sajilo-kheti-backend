import { z } from 'zod';

const clerkIdSchema = z.string().min(1, 'Clerk ID is required');

export const LandStatusSchema = z.enum(['AVAILABLE', 'IN_NEGOTIATION', 'LEASED', 'HIDDEN']);

// POST /land/publish
export const publishLandInputSchema = z.object({
  ownerId: clerkIdSchema,
  location: z.string().min(1, 'Location is required'),
  size: z.number().positive('Size must be positive'),
  price: z.number().positive('Price must be positive'),
  description: z.string().min(1, 'Description is required'),
  landpic: z.string().url('Invalid hero image URL'),
  morelandpic: z
    .array(z.string().url('Invalid gallery image URL'))
    .max(5, 'Maximum 5 gallery images allowed')
    .optional()
    .default([]),
  title: z.string().optional(),
  lalpurjaUrl: z.string()
});

export const publishLandResponseSchema = z.object({
  id: z.string(),
  ownerId: z.string(),
  location: z.string(),
  sizeInSqFt: z.number(),
  pricePerMonth: z.number(),
  description: z.string(),
  heroImageUrl: z.string(),
  galleryUrls: z.array(z.string()),
  status: z.string(),
  createdAt: z.date(),
});

// GET /land/search
export const searchLandInputSchema = z.object({
  location: z.string().optional(),
  minPrice: z.number().optional(),
  maxPrice: z.number().optional(),
  minSize: z.number().optional(),
  maxSize: z.number().optional(),
});

export const landSchema = z.object({
  id: z.string(),
  ownerId: z.string(),
  title: z.string().nullable(),
  description: z.string(),
  location: z.string(),
  area: z.string().nullable(),
  sizeInSqFt: z.number(),
  pricePerMonth: z.number(),
  heroImageUrl: z.string(),
  galleryUrls: z.array(z.string()),
  status: z.string(),
  createdAt: z.date(),
});

export const searchLandResponseSchema = z.object({
  lands: z.array(landSchema),
});

// GET /land/{landId}
export const getLandByIdInputSchema = z.object({
  landId: z.string().min(1, 'Land ID is required'),
});

// PUT /land/{landId}/status
export const updateLandStatusInputSchema = z.object({
  landId: z.string().min(1, 'Land ID is required'),
  status: LandStatusSchema,
});

export const updateLandStatusResponseSchema = z.object({
  id: z.string(),
  status: z.string(),
});
