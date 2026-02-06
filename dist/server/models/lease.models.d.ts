import { z } from 'zod';
export declare const requestedLeaseInputSchema: z.ZodObject<{
    leaserId: z.ZodString;
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
            REJECTED: "REJECTED";
            ACCEPTED: "ACCEPTED";
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
            REJECTED: "REJECTED";
            ACCEPTED: "ACCEPTED";
            COMPLETED: "COMPLETED";
        }>;
    }, z.core.$strip>;
}, z.core.$strip>;
export declare const getApplicationByIdInputSchema: z.ZodObject<{
    applicationId: z.ZodString;
}, z.core.$strip>;
export declare const getApplicationByIdResponseSchema: z.ZodObject<{
    id: z.ZodString;
    landId: z.ZodString;
    leaserId: z.ZodString;
    plans: z.ZodString;
    leaseDurationInMonths: z.ZodNumber;
    proposedMonthlyRent: z.ZodNumber;
    status: z.ZodEnum<{
        PENDING: "PENDING";
        REJECTED: "REJECTED";
        ACCEPTED: "ACCEPTED";
        COMPLETED: "COMPLETED";
    }>;
    additionalMessages: z.ZodNullable<z.ZodString>;
    createdAt: z.ZodDate;
    land: z.ZodOptional<z.ZodObject<{
        title: z.ZodNullable<z.ZodString>;
        location: z.ZodString;
        area: z.ZodNullable<z.ZodString>;
        pricePerMonth: z.ZodNumber;
    }, z.core.$strip>>;
    leaser: z.ZodOptional<z.ZodObject<{
        id: z.ZodString;
        name: z.ZodNullable<z.ZodString>;
        email: z.ZodString;
        phone: z.ZodNullable<z.ZodString>;
    }, z.core.$strip>>;
}, z.core.$strip>;
export declare const getAllApplicationsInputSchema: z.ZodObject<{
    status: z.ZodOptional<z.ZodEnum<{
        PENDING: "PENDING";
        REJECTED: "REJECTED";
        ACCEPTED: "ACCEPTED";
        COMPLETED: "COMPLETED";
    }>>;
    landId: z.ZodOptional<z.ZodString>;
    leaserId: z.ZodOptional<z.ZodString>;
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
            REJECTED: "REJECTED";
            ACCEPTED: "ACCEPTED";
            COMPLETED: "COMPLETED";
        }>;
        additionalMessages: z.ZodNullable<z.ZodString>;
        createdAt: z.ZodDate;
        land: z.ZodOptional<z.ZodObject<{
            title: z.ZodNullable<z.ZodString>;
            location: z.ZodString;
            area: z.ZodNullable<z.ZodString>;
            pricePerMonth: z.ZodNumber;
        }, z.core.$strip>>;
        leaser: z.ZodOptional<z.ZodObject<{
            id: z.ZodString;
            name: z.ZodNullable<z.ZodString>;
            email: z.ZodString;
            phone: z.ZodNullable<z.ZodString>;
        }, z.core.$strip>>;
    }, z.core.$strip>>;
    total: z.ZodNumber;
}, z.core.$strip>;
export declare const payEscrowInputSchema: z.ZodObject<{
    applicationId: z.ZodString;
    amount: z.ZodNumber;
    paymentId: z.ZodString;
    commission: z.ZodNumber;
}, z.core.$strip>;
export declare const payEscrowResponseSchema: z.ZodObject<{
    success: z.ZodBoolean;
    message: z.ZodString;
    escrow: z.ZodObject<{
        id: z.ZodString;
        applicationId: z.ZodString;
        amount: z.ZodNumber;
        status: z.ZodEnum<{
            HOLDING: "HOLDING";
            RELEASED: "RELEASED";
            REFUNDED: "REFUNDED";
        }>;
    }, z.core.$strip>;
    landStatus: z.ZodEnum<{
        AVAILABLE: "AVAILABLE";
        IN_NEGOTIATION: "IN_NEGOTIATION";
        LEASED: "LEASED";
        HIDDEN: "HIDDEN";
    }>;
}, z.core.$strip>;
export declare const verifyMalpotPapersInputSchema: z.ZodObject<{
    applicationId: z.ZodString;
    malpotPaperUrl: z.ZodString;
    adminId: z.ZodString;
}, z.core.$strip>;
export declare const verifyMalpotPapersResponseSchema: z.ZodObject<{
    success: z.ZodBoolean;
    message: z.ZodString;
    application: z.ZodObject<{
        id: z.ZodString;
        status: z.ZodEnum<{
            PENDING: "PENDING";
            REJECTED: "REJECTED";
            ACCEPTED: "ACCEPTED";
            COMPLETED: "COMPLETED";
        }>;
    }, z.core.$strip>;
    landStatus: z.ZodEnum<{
        AVAILABLE: "AVAILABLE";
        IN_NEGOTIATION: "IN_NEGOTIATION";
        LEASED: "LEASED";
        HIDDEN: "HIDDEN";
    }>;
    escrowStatus: z.ZodEnum<{
        HOLDING: "HOLDING";
        RELEASED: "RELEASED";
        REFUNDED: "REFUNDED";
    }>;
}, z.core.$strip>;
//# sourceMappingURL=lease.models.d.ts.map