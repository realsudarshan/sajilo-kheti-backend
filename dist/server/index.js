import { router } from './trpc.js';
import { landRouter } from './routes/land/land.routes.js';
import { userRouter } from './routes/user/user.routes.js';
export const appRouter = router({
    user: userRouter,
    land: landRouter,
});
//# sourceMappingURL=index.js.map