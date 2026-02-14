import { z } from 'zod';
// Sub-schema for the User (Leaser) returned via Prisma include
const BaseLeaserSchema = z.object({
    id: z.string(),
    name: z.string().nullable(),
    role: z.enum(['LEASER', 'OWNER', 'ADMIN']),
    isKycVerified: z.boolean(),
    createdAt: z.date(),
    updatedAt: z.date(),
});
// Sub-schema for the Land returned via Prisma include
const BaseLandSchema = z.object({
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
    status: z.enum([
        'AVAILABLE',
        'UNVERIFIED',
        'REJECTED',
        'IN_NEGOTIATION',
        'LEASED',
        'HIDDEN'
    ]),
    createdAt: z.date(),
    updatedAt: z.date(),
});
export const getApplicationByIdResponseSchema = z.object({
    id: z.string(),
    landId: z.string(),
    leaserId: z.string(),
    plans: z.string(),
    leaseDurationInMonths: z.number(),
    proposedMonthlyRent: z.number(),
    status: z.enum(['PENDING', 'ACCEPTED', 'REJECTED', 'COMPLETED']),
    additionalMessages: z.string().nullable(),
    createdAt: z.date(),
    land: BaseLandSchema,
    leaser: BaseLeaserSchema,
});
export const getAllApplicationsResponseSchema = z.object({
    applications: z.array(getApplicationByIdResponseSchema),
    total: z.number(),
});
export const requestedLeaseInputSchema = z.object({
    landId: z.string(),
    leaseDurationInMonths: z.number().positive(),
    proposedMonthlyRent: z.number().positive(),
    plans: z.string(),
    additionalMessages: z.string().optional(),
});
export const requestedLeaseResponseSchema = z.object({
    leaseAgreementId: z.string(),
    leaserId: z.string(),
    landId: z.string(),
    leaseDurationInMonths: z.number(),
    proposedMonthlyRent: z.number(),
});
export const acceptApplicationInputSchema = z.object({ applicationId: z.string() });
export const acceptApplicationResponseSchema = z.object({
    success: z.boolean(),
    message: z.string(),
    application: z.object({
        id: z.string(),
        status: z.enum(['PENDING', 'ACCEPTED', 'REJECTED', 'COMPLETED']),
        leaserId: z.string(),
        landId: z.string(),
    }),
});
export const rejectApplicationInputSchema = z.object({
    applicationId: z.string(),
    reason: z.string().optional()
});
export const rejectApplicationResponseSchema = z.object({
    success: z.boolean(),
    message: z.string(),
    application: z.object({
        id: z.string(),
        status: z.enum(['PENDING', 'ACCEPTED', 'REJECTED', 'COMPLETED']),
    }),
});
export const getApplicationByIdInputSchema = z.object({ applicationId: z.string() });
export const getAllApplicationsInputSchema = z.object({
    status: z.enum(['PENDING', 'ACCEPTED', 'REJECTED', 'COMPLETED']).optional(),
    landId: z.string().optional(),
    leaserId: z.string().optional(),
});
//# sourceMappingURL=lease.models.js.map