import { z } from 'zod';
export const requestedLeaseInputSchema = z.object({
  leaserId: z.string(),
  landId: z.string(),
  leaseDurationInMonths: z.number().positive('Lease duration must be positive'),
  proposedMonthlyRent: z.number().positive('Proposed rent must be positive'),
  plans: z.string(),
  additionalMessages: z.string().optional()
});
export const requestedLeaseResponseSchema = z.object({
  leaseAgreementId: z.string(),
  leaserId: z.string(),
  landId: z.string(),
  leaseDurationInMonths: z.number(),
  proposedMonthlyRent: z.number()
});

// Accept Application Schemas
export const acceptApplicationInputSchema = z.object({
  applicationId: z.string(),
});

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

// Reject Application Schemas
export const rejectApplicationInputSchema = z.object({
  applicationId: z.string(),
  reason: z.string().optional(),
});

export const rejectApplicationResponseSchema = z.object({
  success: z.boolean(),
  message: z.string(),
  application: z.object({
    id: z.string(),
    status: z.enum(['PENDING', 'ACCEPTED', 'REJECTED', 'COMPLETED']),
  }),
});

// Get Application by ID Schemas
export const getApplicationByIdInputSchema = z.object({
  applicationId: z.string(),
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
  land: z.object({
    title: z.string().nullable(),
    location: z.string(),
    area: z.string().nullable(),
    pricePerMonth: z.number(),
  }).optional(),
  leaser: z.object({
    id: z.string(),
    name: z.string().nullable(),
    email: z.string(),
    phone: z.string().nullable(),
  }).optional(),
});

// Get All Applications Schemas
export const getAllApplicationsInputSchema = z.object({
  status: z.enum(['PENDING', 'ACCEPTED', 'REJECTED', 'COMPLETED']).optional(),
  landId: z.string().optional(),
  leaserId: z.string().optional(),
});

export const getAllApplicationsResponseSchema = z.object({
  applications: z.array(z.object({
    id: z.string(),
    landId: z.string(),
    leaserId: z.string(),
    plans: z.string(),
    leaseDurationInMonths: z.number(),
    proposedMonthlyRent: z.number(),
    status: z.enum(['PENDING', 'ACCEPTED', 'REJECTED', 'COMPLETED']),
    additionalMessages: z.string().nullable(),
    createdAt: z.date(),
    land: z.object({
      title: z.string().nullable(),
      location: z.string(),
      area: z.string().nullable(),
      pricePerMonth: z.number(),
    }).optional(),
    leaser: z.object({
      id: z.string(),
      name: z.string().nullable(),
      email: z.string(),
      phone: z.string().nullable(),
    }).optional(),
  })),
  total: z.number(),
});

