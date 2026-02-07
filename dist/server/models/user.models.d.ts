import { z } from 'zod';
export declare const UserRoleSchema: z.ZodEnum<{
    LEASER: "LEASER";
    OWNER: "OWNER";
    ADMIN: "ADMIN";
}>;
export declare const KycStatusSchema: z.ZodEnum<{
    PENDING: "PENDING";
    REJECTED: "REJECTED";
    APPROVED: "APPROVED";
}>;
export declare const UserSchema: z.ZodObject<{
    id: z.ZodString;
    role: z.ZodEnum<{
        LEASER: "LEASER";
        OWNER: "OWNER";
        ADMIN: "ADMIN";
    }>;
    isKycVerified: z.ZodBoolean;
    createdAt: z.ZodDate;
}, z.core.$strip>;
export declare const getAllUsersResponseSchema: z.ZodObject<{
    users: z.ZodArray<z.ZodObject<{
        id: z.ZodString;
        role: z.ZodEnum<{
            LEASER: "LEASER";
            OWNER: "OWNER";
            ADMIN: "ADMIN";
        }>;
        isKycVerified: z.ZodBoolean;
        createdAt: z.ZodDate;
        email: z.ZodString;
        name: z.ZodString;
        imageUrl: z.ZodOptional<z.ZodString>;
    }, z.core.$strip>>;
}, z.core.$strip>;
export declare const createUserInputSchema: z.ZodObject<{
    id: z.ZodString;
}, z.core.$strip>;
export declare const createUserResponseSchema: z.ZodObject<{
    id: z.ZodString;
    role: z.ZodEnum<{
        LEASER: "LEASER";
        OWNER: "OWNER";
        ADMIN: "ADMIN";
    }>;
    isKycVerified: z.ZodBoolean;
    createdAt: z.ZodDate;
}, z.core.$strip>;
export declare const upgradeRequestInputSchema: z.ZodObject<{
    citizenshipNumber: z.ZodString;
    documentUrl: z.ZodString;
    selfieUrl: z.ZodOptional<z.ZodString>;
}, z.core.$strip>;
export declare const upgradeRequestResponseSchema: z.ZodObject<{
    id: z.ZodString;
    userId: z.ZodString;
    status: z.ZodString;
    citizenshipNumber: z.ZodString;
    documentUrl: z.ZodString;
    selfieUrl: z.ZodNullable<z.ZodString>;
}, z.core.$strip>;
export declare const updateKycStatusInputSchema: z.ZodObject<{
    userId: z.ZodString;
    status: z.ZodEnum<{
        PENDING: "PENDING";
        REJECTED: "REJECTED";
        APPROVED: "APPROVED";
    }>;
}, z.core.$strip>;
export declare const updateKycStatusResponseSchema: z.ZodObject<{
    userId: z.ZodString;
    kycStatus: z.ZodString;
    userRole: z.ZodEnum<{
        LEASER: "LEASER";
        OWNER: "OWNER";
        ADMIN: "ADMIN";
    }>;
    isKycVerified: z.ZodBoolean;
}, z.core.$strip>;
//# sourceMappingURL=user.models.d.ts.map