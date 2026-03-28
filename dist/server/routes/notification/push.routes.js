import { z } from 'zod';
import { clerkAuthedProcedure, router } from '../../trpc.js';
import { webpush } from '../../lib/webpush.js';
export const pushRouter = router({
    subscribe: clerkAuthedProcedure
        .input(z.object({
        endpoint: z.string(),
        keys: z.object({
            p256dh: z.string(),
            auth: z.string(),
        })
    }))
        .mutation(async ({ ctx, input }) => {
        const { endpoint, keys } = input;
        const sub = await ctx.prisma.pushSubscription.upsert({
            where: { endpoint },
            create: {
                userId: ctx.userId,
                endpoint,
                p256dh: keys.p256dh,
                auth: keys.auth,
            },
            update: {
                userId: ctx.userId,
                p256dh: keys.p256dh,
                auth: keys.auth,
            }
        });
        return { success: true, id: sub.id };
    }),
    unsubscribe: clerkAuthedProcedure
        .input(z.object({
        endpoint: z.string()
    }))
        .mutation(async ({ ctx, input }) => {
        await ctx.prisma.pushSubscription.deleteMany({
            where: {
                endpoint: input.endpoint,
                userId: ctx.userId
            }
        });
        return { success: true };
    }),
    testPush: clerkAuthedProcedure
        .mutation(async ({ ctx }) => {
        const subs = await ctx.prisma.pushSubscription.findMany({
            where: { userId: ctx.userId }
        });
        if (subs.length === 0) {
            throw new Error('No push subscriptions found for user');
        }
        const payload = JSON.stringify({
            title: 'Push Web Setup Successful!',
            body: 'Your device is ready to receive SajiloKheti alerts.',
            url: '/dashboard'
        });
        const results = await Promise.allSettled(subs.map(sub => webpush.sendNotification({
            endpoint: sub.endpoint,
            keys: {
                p256dh: sub.p256dh,
                auth: sub.auth
            }
        }, payload)));
        // Cleanup expired subscriptions (410 Gone)
        const failed = results.filter(r => r.status === 'rejected');
        for (const fail of failed) {
            if (fail.reason?.statusCode === 410) {
                await ctx.prisma.pushSubscription.deleteMany({
                    where: { endpoint: fail.reason.endpoint }
                });
            }
        }
        return { sent: subs.length, successCount: results.filter(r => r.status === 'fulfilled').length };
    }),
});
//# sourceMappingURL=push.routes.js.map