import { z } from 'zod';
export declare const UserSchema: z.ZodObject<{
    id: z.ZodNumber;
    name: z.ZodString;
    adress: z.ZodOptional<z.ZodString>;
    email: z.ZodString;
}, z.core.$strip>;
export type User = z.infer<typeof UserSchema>;
export declare const getAllUsersResponseSchema: z.ZodObject<{
    users: z.ZodArray<z.ZodObject<{
        id: z.ZodNumber;
        name: z.ZodString;
        adress: z.ZodOptional<z.ZodString>;
        email: z.ZodString;
    }, z.core.$strip>>;
}, z.core.$strip>;
//# sourceMappingURL=models.d.ts.map