import { z } from 'zod';
export const LandStatusSchema = z.enum(['AVAILABLE', 'IN_NEGOTIATION', 'LEASED', 'HIDDEN']);
export const LandUnitSchema = z.enum([
    "ROPANI", "AANA", "PAISA", "DAAM",
    "BIGHA", "KATTHA", "DHUR",
    "SQ_FT", "SQ_MTR"
]);
export const LandSizeSchema = z.object({
    size: z.number().positive("Size must be a positive number"),
    unit: LandUnitSchema,
});
// Matches your Prisma "Land" model exactly
export const landSchema = z.object({
    id: z.string(),
    ownerId: z.string(),
    title: z.string(),
    description: z.string(),
    location: z.string(),
    area: z.string().nullable(),
    sizeInSqFt: z.number(),
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
//# sourceMappingURL=land.models.js.map