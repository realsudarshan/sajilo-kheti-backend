import { z } from 'zod';
export declare const getApplicationByIdResponseSchema: z.ZodObject<{
    id: z.ZodString;
    landId: z.ZodString;
    leaserId: z.ZodString;
    plans: z.ZodString;
    leaseDurationInMonths: z.ZodNumber;
    proposedMonthlyRent: z.ZodNumber;
    status: z.ZodEnum<{
        PENDING: "PENDING";
        ACCEPTED: "ACCEPTED";
        REJECTED: "REJECTED";
        COMPLETED: "COMPLETED";
    }>;
    additionalMessages: z.ZodNullable<z.ZodString>;
    createdAt: z.ZodDate;
    land: z.ZodObject<{
        id: z.ZodString;
        ownerId: z.ZodString;
        title: z.ZodString;
        description: z.ZodString;
        location: z.ZodString;
        area: z.ZodNullable<z.ZodString>;
        sizeInSqFt: z.ZodNumber;
        pricePerMonth: z.ZodNumber;
        heroImageUrl: z.ZodString;
        galleryUrls: z.ZodArray<z.ZodString>;
        lalpurjaUrl: z.ZodNullable<z.ZodString>;
        status: z.ZodEnum<{
            AVAILABLE: "AVAILABLE";
            IN_NEGOTIATION: "IN_NEGOTIATION";
            LEASED: "LEASED";
            HIDDEN: "HIDDEN";
        }>;
        createdAt: z.ZodDate;
        updatedAt: z.ZodDate;
    }, z.core.$strip>;
    leaser: z.ZodObject<{
        id: z.ZodString;
        name: z.ZodNullable<z.ZodString>;
        role: z.ZodEnum<{
            LEASER: "LEASER";
            OWNER: "OWNER";
            ADMIN: "ADMIN";
        }>;
        isKycVerified: z.ZodBoolean;
        createdAt: z.ZodDate;
        updatedAt: z.ZodDate;
    }, z.core.$strip>;
}, z.core.$strip>;
export declare const getAllApplicationsResponseSchema: z.ZodObject<{
    applications: z.ZodArray<z.ZodObject<{
        id: z.ZodString;
        landId: z.ZodString;
        leaserId: z.ZodString;
        plans: z.ZodString;
        leaseDurationInMonths: z.ZodNumber;
        proposedMonthlyRent: z.ZodNumber;
        status: z.ZodEnum<{
            PENDING: "PENDING";
            ACCEPTED: "ACCEPTED";
            REJECTED: "REJECTED";
            COMPLETED: "COMPLETED";
        }>;
        additionalMessages: z.ZodNullable<z.ZodString>;
        createdAt: z.ZodDate;
        land: z.ZodObject<{
            id: z.ZodString;
            ownerId: z.ZodString;
            title: z.ZodString;
            description: z.ZodString;
            location: z.ZodString;
            area: z.ZodNullable<z.ZodString>;
            sizeInSqFt: z.ZodNumber;
            pricePerMonth: z.ZodNumber;
            heroImageUrl: z.ZodString;
            galleryUrls: z.ZodArray<z.ZodString>;
            lalpurjaUrl: z.ZodNullable<z.ZodString>;
            status: z.ZodEnum<{
                AVAILABLE: "AVAILABLE";
                IN_NEGOTIATION: "IN_NEGOTIATION";
                LEASED: "LEASED";
                HIDDEN: "HIDDEN";
            }>;
            createdAt: z.ZodDate;
            updatedAt: z.ZodDate;
        }, z.core.$strip>;
        leaser: z.ZodObject<{
            id: z.ZodString;
            name: z.ZodNullable<z.ZodString>;
            role: z.ZodEnum<{
                LEASER: "LEASER";
                OWNER: "OWNER";
                ADMIN: "ADMIN";
            }>;
            isKycVerified: z.ZodBoolean;
            createdAt: z.ZodDate;
            updatedAt: z.ZodDate;
        }, z.core.$strip>;
    }, z.core.$strip>>;
    total: z.ZodNumber;
}, z.core.$strip>;
export declare const requestedLeaseInputSchema: z.ZodObject<{
    landId: z.ZodString;
    leaseDurationInMonths: z.ZodNumber;
    proposedMonthlyRent: z.ZodNumber;
    plans: z.ZodString;
    additionalMessages: z.ZodOptional<z.ZodString>;
}, z.core.$strip>;
export declare const requestedLeaseResponseSchema: z.ZodObject<{
    leaseAgreementId: z.ZodString;
    leaserId: z.ZodString;
    landId: z.ZodString;
    leaseDurationInMonths: z.ZodNumber;
    proposedMonthlyRent: z.ZodNumber;
}, z.core.$strip>;
export declare const acceptApplicationInputSchema: z.ZodObject<{
    applicationId: z.ZodString;
}, z.core.$strip>;
export declare const acceptApplicationResponseSchema: z.ZodObject<{
    success: z.ZodBoolean;
    message: z.ZodString;
    application: z.ZodObject<{
        id: z.ZodString;
        status: z.ZodEnum<{
            PENDING: "PENDING";
            ACCEPTED: "ACCEPTED";
            REJECTED: "REJECTED";
            COMPLETED: "COMPLETED";
        }>;
        leaserId: z.ZodString;
        landId: z.ZodString;
    }, z.core.$strip>;
}, z.core.$strip>;
export declare const rejectApplicationInputSchema: z.ZodObject<{
    applicationId: z.ZodString;
    reason: z.ZodOptional<z.ZodString>;
}, z.core.$strip>;
export declare const rejectApplicationResponseSchema: z.ZodObject<{
    success: z.ZodBoolean;
    message: z.ZodString;
    application: z.ZodObject<{
        id: z.ZodString;
        status: z.ZodEnum<{
            PENDING: "PENDING";
            ACCEPTED: "ACCEPTED";
            REJECTED: "REJECTED";
            COMPLETED: "COMPLETED";
        }>;
    }, z.core.$strip>;
}, z.core.$strip>;
export declare const getApplicationByIdInputSchema: z.ZodObject<{
    applicationId: z.ZodString;
}, z.core.$strip>;
export declare const getAllApplicationsInputSchema: z.ZodObject<{
    status: z.ZodOptional<z.ZodEnum<{
        PENDING: "PENDING";
        ACCEPTED: "ACCEPTED";
        REJECTED: "REJECTED";
        COMPLETED: "COMPLETED";
    }>>;
    landId: z.ZodOptional<z.ZodString>;
    leaserId: z.ZodOptional<z.ZodString>;
}, z.core.$strip>;
//# sourceMappingURL=lease.models.d.ts.map