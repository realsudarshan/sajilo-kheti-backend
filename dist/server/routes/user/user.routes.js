import z from 'zod';
import { publicProcedure, router } from '../../trpc.js';
import { getAllUsersResponseSchema } from '../../models.js';
//create dummy user array
const users = [
    { id: 1, name: 'John Doe', email: 'john@example.com' },
    { id: 2, name: 'Jane Smith', email: 'jane@example.com' },
];
export const userRouter = router({
    // Define user-related procedures here
    getAllUser: publicProcedure.
        meta({ openapi: { method: 'GET', path: '/users', description: 'Get all users' } }).
        input(z.undefined()).
        output(getAllUsersResponseSchema)
        .query(() => {
        return {
            users
        };
    })
});
//# sourceMappingURL=user.routes.js.map