import { z } from 'zod';
export const UserRoleSchema = z.enum(['LEASER', 'OWNER', 'ADMIN']);
export const KycStatusSchema = z.enum(['PENDING', 'APPROVED', 'REJECTED']);
// This matches exactly what is in your MongoDB
export const UserSchema = z.object({
    id: z.string(),
    role: UserRoleSchema,
    isKycVerified: z.boolean(),
    createdAt: z.date(),
});
export const getAllUsersResponseSchema = z.object({
    users: z.array(UserSchema.extend({
        email: z.string(),
        name: z.string(),
        imageUrl: z.string().optional(),
    })),
});
export const createUserInputSchema = z.object({
    id: z.string().min(1),
});
export const createUserResponseSchema = UserSchema;
export const upgradeRequestInputSchema = z.object({
    paymentNumber: z.string().regex(/^(97|98)\d{8}$/, 'Payment number must be a valid Nepali phone number (e.g. 98XXXXXXXX)'),
    citizenshipNumber: z.string().min(1),
    documentUrl: z.string().url(),
    selfieUrl: z.string().url().optional(),
});
export const upgradeRequestResponseSchema = z.object({
    id: z.string(),
    userId: z.string(),
    status: z.string(),
    citizenshipNumber: z.string(),
    documentUrl: z.string(),
    selfieUrl: z.string().nullable(),
    paymentNumber: z.string().nullable(),
});
export const updateKycStatusInputSchema = z.object({
    userId: z.string(),
    status: KycStatusSchema,
});
export const updateKycStatusResponseSchema = z.object({
    userId: z.string(),
    kycStatus: z.string(),
    userRole: UserRoleSchema,
    isKycVerified: z.boolean(),
});
//# sourceMappingURL=user.models.js.map