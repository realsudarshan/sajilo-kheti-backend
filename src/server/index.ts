import { escrowRouter } from './routes/escrow/escrow.routes.js';
import { landRouter } from './routes/land/land.routes.js';
import { leaseRouter } from './routes/lease/lease.routes.js';
import { userRouter } from './routes/user/user.routes.js';
import { pushRouter } from './routes/notification/push.routes.js';
import { router } from './trpc.js';

export const appRouter = router({
  user: userRouter,
  land: landRouter,
  lease: leaseRouter,
  escrow: escrowRouter,
  push: pushRouter
});

// Export type router type signature,
// NOT the router itself.
export type AppRouter = typeof appRouter;