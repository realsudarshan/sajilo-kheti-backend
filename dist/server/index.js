import { router } from './trpc.js';
import { userRouter } from './routes/user/user.routes.js';
//Root Router
export const appRouter = router({
    user: userRouter,
});
//# sourceMappingURL=index.js.map