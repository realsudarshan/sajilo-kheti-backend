import { z } from 'zod';

export const LandStatusSchema = z.enum(['AVAILABLE','UNVERIFIED','REJECTED', 'IN_NEGOTIATION', 'LEASED', 'HIDDEN']);

// This handles the compound units (Ropani-Aana-Paisa-Daam, etc.)
export const LandSizeSchema = z.discriminatedUnion("system", [
  z.object({
    system: z.literal("HILLY"),
    ropani: z.number().min(0).default(0),
    aana: z.number().min(0).max(15.99).default(0),
    paisa: z.number().min(0).max(3.99).default(0),
    daam: z.number().min(0).max(3.99).default(0),
  }),
  z.object({
    system: z.literal("TERAI"),
    bigha: z.number().min(0).default(0),
    kattha: z.number().min(0).max(19.99).default(0),
    dhur: z.number().min(0).max(19.99).default(0),
  }),
  z.object({
    system: z.literal("FLAT"),
    value: z.number().positive(),
    unit: z.enum(["SQ_FT", "SQ_MTR"]),
  }),
]);

export const landSchema = z.object({
  id: z.string(),
  ownerId: z.string(),
  title: z.string(),
  description: z.string(),
  location: z.string(),
  sizeInSqmeter: z.number(),
  pricePerMonth: z.number(),
  heroImageUrl: z.string(),
  galleryUrls: z.array(z.string()),
  lalpurjaUrl: z.string().nullable(),
  status: LandStatusSchema,
  createdAt: z.date(),
  updatedAt: z.date(),
});

export const publishLandInputSchema = z.object({
  ownerId: z.string().min(1),
  title: z.string().min(1),
  location: z.string().min(1),
  size: LandSizeSchema,
  price: z.number().positive(),
  description: z.string().min(1),
  landpic: z.string().url(),
  morelandpic: z.array(z.string().url()).optional().default([]),
  lalpurjaUrl: z.string().optional(),
});

export const publishLandResponseSchema = landSchema;

export const searchLandInputSchema = z.object({
  location: z.string().optional(),
  minPrice: z.number().optional(),
  maxPrice: z.number().optional(),
  minSize: z.number().optional(),
  maxSize: z.number().optional(),
});

// FIXED: Added the missing export
export const searchLandResponseSchema = z.object({
  lands: z.array(landSchema),
});

export const getLandByIdInputSchema = z.object({
  landId: z.string().min(1),
});

export const updateLandStatusInputSchema = z.object({
  landId: z.string().min(1),
  status: LandStatusSchema,
});

export const updateLandStatusResponseSchema = z.object({
  id: z.string(),
  status: LandStatusSchema,
});