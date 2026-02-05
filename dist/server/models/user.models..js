import { z } from 'zod';
export const UserRoleSchema = z.enum(['LEASER', 'OWNER', 'ADMIN']);
export const UserSchema = z.object({
    id: z.string(),
    name: z.string().nullable(),
    email: z.string().email(),
    phone: z.string().nullable(),
    role: z.string(),
    createdAt: z.date(),
});
export const getAllUsersResponseSchema = z.object({
    users: z.array(UserSchema),
});
const clerkIdSchema = z.string().min(1, 'Clerk ID is required');
export const createUserInputSchema = z.object({
    id: clerkIdSchema, // Clerk ID from frontend - primary key
    email: z.string().email(),
    password: z.string().min(6),
    name: z.string().optional(),
    phone: z.string().optional(),
    role: UserRoleSchema.optional(),
});
export const createUserResponseSchema = z.object({
    id: z.string(),
    email: z.string(),
    name: z.string().nullable(),
    phone: z.string().nullable(),
    role: z.string(),
    createdAt: z.date(),
});
// KYC / Upgrade to Land Owner
export const upgradeRequestInputSchema = z.object({
    userId: clerkIdSchema, // Clerk ID of the requesting user
    citizenshipNumber: z.string().min(1, 'Citizenship number is required'),
    documentUrl: z.string().url('Invalid document URL'),
    selfieUrl: z.string().url('Invalid selfie URL').optional(),
});
export const upgradeRequestResponseSchema = z.object({
    id: z.string(),
    userId: z.string(),
    status: z.string(),
    citizenshipNumber: z.string(),
    documentUrl: z.string(),
    selfieUrl: z.string().nullable(),
});
export const KycStatusSchema = z.enum(['PENDING', 'APPROVED', 'REJECTED']);
export const updateKycStatusInputSchema = z.object({
    userId: clerkIdSchema, // Clerk ID of the user whose KYC to approve/reject
    status: KycStatusSchema,
});
export const updateKycStatusResponseSchema = z.object({
    userId: z.string(),
    kycStatus: z.string(),
    userRole: z.string(),
    isKycVerified: z.boolean(),
});
//# sourceMappingURL=user.models..js.map