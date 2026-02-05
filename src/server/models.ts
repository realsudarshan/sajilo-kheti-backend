import {email, z} from 'zod';

export const UserSchema = z.object({
  id: z.number(),
  name: z.string(),
  adress: z.string().optional(),
  email: z.string().email(),
});
export type User = z.infer<typeof UserSchema>;
export const getAllUsersResponseSchema = z.object({
  users: z.array(UserSchema),
});

