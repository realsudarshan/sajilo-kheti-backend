import { z } from 'zod';
export declare const UserRoleSchema: z.ZodEnum<{
    LEASER: "LEASER";
    OWNER: "OWNER";
    ADMIN: "ADMIN";
}>;
export declare const UserSchema: z.ZodObject<{
    id: z.ZodString;
    name: z.ZodNullable<z.ZodString>;
    email: z.ZodString;
    phone: z.ZodNullable<z.ZodString>;
    role: z.ZodString;
    createdAt: z.ZodDate;
}, z.core.$strip>;
export type User = z.infer<typeof UserSchema>;
export declare const getAllUsersResponseSchema: z.ZodObject<{
    users: z.ZodArray<z.ZodObject<{
        id: z.ZodString;
        name: z.ZodNullable<z.ZodString>;
        email: z.ZodString;
        phone: z.ZodNullable<z.ZodString>;
        role: z.ZodString;
        createdAt: z.ZodDate;
    }, z.core.$strip>>;
}, z.core.$strip>;
export declare const createUserInputSchema: z.ZodObject<{
    id: z.ZodString;
    email: z.ZodString;
    password: z.ZodString;
    name: z.ZodOptional<z.ZodString>;
    phone: z.ZodOptional<z.ZodString>;
    role: z.ZodOptional<z.ZodEnum<{
        LEASER: "LEASER";
        OWNER: "OWNER";
        ADMIN: "ADMIN";
    }>>;
}, z.core.$strip>;
export declare const createUserResponseSchema: z.ZodObject<{
    id: z.ZodString;
    email: z.ZodString;
    name: z.ZodNullable<z.ZodString>;
    phone: z.ZodNullable<z.ZodString>;
    role: z.ZodString;
    createdAt: z.ZodDate;
}, z.core.$strip>;
export declare const upgradeRequestInputSchema: z.ZodObject<{
    userId: z.ZodString;
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
export declare const KycStatusSchema: z.ZodEnum<{
    PENDING: "PENDING";
    APPROVED: "APPROVED";
    REJECTED: "REJECTED";
}>;
export declare const updateKycStatusInputSchema: z.ZodObject<{
    userId: z.ZodString;
    status: z.ZodEnum<{
        PENDING: "PENDING";
        APPROVED: "APPROVED";
        REJECTED: "REJECTED";
    }>;
}, z.core.$strip>;
export declare const updateKycStatusResponseSchema: z.ZodObject<{
    userId: z.ZodString;
    kycStatus: z.ZodString;
    userRole: z.ZodString;
    isKycVerified: z.ZodBoolean;
}, z.core.$strip>;
//# sourceMappingURL=user.models.d.ts.map