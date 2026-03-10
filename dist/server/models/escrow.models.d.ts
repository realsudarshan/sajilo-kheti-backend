import { z } from "zod";
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
        UNVERIFIED: "UNVERIFIED";
        REJECTED: "REJECTED";
        IN_NEGOTIATION: "IN_NEGOTIATION";
        LEASED: "LEASED";
        HIDDEN: "HIDDEN";
    }>;
}, z.core.$strip>;
export declare const submitMalpotPapersInputSchema: z.ZodObject<{
    escrowId: z.ZodString;
    malpotPaperUrl: z.ZodString;
}, z.core.$strip>;
export declare const submitMalpotPapersResponseSchema: z.ZodObject<{
    success: z.ZodBoolean;
    message: z.ZodString;
}, z.core.$strip>;
export declare const verifyMalpotPapersInputSchema: z.ZodObject<{
    applicationId: z.ZodString;
    malpotPaperUrl: z.ZodString;
    adminId: z.ZodOptional<z.ZodString>;
}, z.core.$strip>;
export declare const verifyMalpotPapersResponseSchema: z.ZodObject<{
    success: z.ZodBoolean;
    message: z.ZodString;
    application: z.ZodObject<{
        id: z.ZodString;
        status: z.ZodEnum<{
            REJECTED: "REJECTED";
            PENDING: "PENDING";
            ACCEPTED: "ACCEPTED";
            COMPLETED: "COMPLETED";
        }>;
    }, z.core.$strip>;
    landStatus: z.ZodEnum<{
        AVAILABLE: "AVAILABLE";
        UNVERIFIED: "UNVERIFIED";
        REJECTED: "REJECTED";
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
export declare const saveChatChannelInputSchema: z.ZodObject<{
    applicationId: z.ZodString;
    chatChannelId: z.ZodString;
}, z.core.$strip>;
export declare const saveChatChannelResponseSchema: z.ZodObject<{
    success: z.ZodBoolean;
    message: z.ZodString;
}, z.core.$strip>;
export declare const getMyEscrowsResponseSchema: z.ZodObject<{
    escrows: z.ZodArray<z.ZodObject<{
        id: z.ZodString;
        applicationId: z.ZodString;
        ownerId: z.ZodString;
        leaserId: z.ZodString;
        amount: z.ZodNumber;
        paymentId: z.ZodNullable<z.ZodString>;
        status: z.ZodEnum<{
            HOLDING: "HOLDING";
            RELEASED: "RELEASED";
            REFUNDED: "REFUNDED";
        }>;
        commission: z.ZodNumber;
        chatChannelId: z.ZodNullable<z.ZodString>;
        landownerMalpotUrl: z.ZodOptional<z.ZodNullable<z.ZodString>>;
        landleaserMalpotUrl: z.ZodOptional<z.ZodNullable<z.ZodString>>;
        createdAt: z.ZodDate;
        updatedAt: z.ZodDate;
        application: z.ZodObject<{
            id: z.ZodString;
            status: z.ZodEnum<{
                REJECTED: "REJECTED";
                PENDING: "PENDING";
                ACCEPTED: "ACCEPTED";
                COMPLETED: "COMPLETED";
            }>;
            leaseDurationInMonths: z.ZodNumber;
            proposedMonthlyRent: z.ZodNumber;
            plans: z.ZodString;
            land: z.ZodObject<{
                id: z.ZodString;
                title: z.ZodString;
                location: z.ZodString;
                heroImageUrl: z.ZodString;
                status: z.ZodEnum<{
                    AVAILABLE: "AVAILABLE";
                    UNVERIFIED: "UNVERIFIED";
                    REJECTED: "REJECTED";
                    IN_NEGOTIATION: "IN_NEGOTIATION";
                    LEASED: "LEASED";
                    HIDDEN: "HIDDEN";
                }>;
            }, z.core.$strip>;
        }, z.core.$strip>;
    }, z.core.$strip>>;
}, z.core.$strip>;
export declare const getMyOwnerEscrowsResponseSchema: z.ZodObject<{
    escrows: z.ZodArray<z.ZodObject<{
        id: z.ZodString;
        applicationId: z.ZodString;
        ownerId: z.ZodString;
        leaserId: z.ZodString;
        amount: z.ZodNumber;
        paymentId: z.ZodNullable<z.ZodString>;
        status: z.ZodEnum<{
            HOLDING: "HOLDING";
            RELEASED: "RELEASED";
            REFUNDED: "REFUNDED";
        }>;
        commission: z.ZodNumber;
        chatChannelId: z.ZodNullable<z.ZodString>;
        landownerMalpotUrl: z.ZodOptional<z.ZodNullable<z.ZodString>>;
        landleaserMalpotUrl: z.ZodOptional<z.ZodNullable<z.ZodString>>;
        createdAt: z.ZodDate;
        updatedAt: z.ZodDate;
        application: z.ZodObject<{
            id: z.ZodString;
            status: z.ZodEnum<{
                REJECTED: "REJECTED";
                PENDING: "PENDING";
                ACCEPTED: "ACCEPTED";
                COMPLETED: "COMPLETED";
            }>;
            leaseDurationInMonths: z.ZodNumber;
            proposedMonthlyRent: z.ZodNumber;
            plans: z.ZodString;
            land: z.ZodObject<{
                id: z.ZodString;
                title: z.ZodString;
                location: z.ZodString;
                heroImageUrl: z.ZodString;
                status: z.ZodEnum<{
                    AVAILABLE: "AVAILABLE";
                    UNVERIFIED: "UNVERIFIED";
                    REJECTED: "REJECTED";
                    IN_NEGOTIATION: "IN_NEGOTIATION";
                    LEASED: "LEASED";
                    HIDDEN: "HIDDEN";
                }>;
            }, z.core.$strip>;
        }, z.core.$strip>;
    }, z.core.$strip>>;
}, z.core.$strip>;
export declare const getEscrowByIdResponseSchema: z.ZodObject<{
    id: z.ZodString;
    amount: z.ZodNumber;
    status: z.ZodEnum<{
        HOLDING: "HOLDING";
        RELEASED: "RELEASED";
        REFUNDED: "REFUNDED";
    }>;
    leaserId: z.ZodString;
    ownerId: z.ZodString;
    applicationId: z.ZodString;
    chatChannelId: z.ZodOptional<z.ZodNullable<z.ZodString>>;
    landownerMalpotUrl: z.ZodOptional<z.ZodNullable<z.ZodString>>;
    landleaserMalpotUrl: z.ZodOptional<z.ZodNullable<z.ZodString>>;
    application: z.ZodObject<{
        land: z.ZodObject<{
            id: z.ZodString;
            title: z.ZodString;
            location: z.ZodString;
            heroImageUrl: z.ZodString;
        }, z.core.$strip>;
    }, z.core.$strip>;
}, z.core.$strip>;
//# sourceMappingURL=escrow.models.d.ts.map