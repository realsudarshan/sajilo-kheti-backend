import { router } from './trpc.js';
import { landRouter } from './routes/land/land.routes.js';
import { userRouter } from './routes/user/user.routes.js';
import { leaseRouter } from './routes/lease/lease.routes.js';

export const appRouter = router({
  user: userRouter,
  land: landRouter,
  lease:leaseRouter
});
 
// Export type router type signature,
// NOT the router itself.
export type AppRouter = typeof appRouter;