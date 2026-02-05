import { router } from './trpc.js';
import { userRouter } from './routes/user/user.routes.js';
    //Root Router
export const appRouter = router({
  user: userRouter,
});
 
// Export type router type signature,
// NOT the router itself.
export type AppRouter = typeof appRouter;