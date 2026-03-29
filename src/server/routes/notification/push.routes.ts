import { z } from 'zod';
import { clerkAuthedProcedure, router } from '../../trpc.js';
import { webpush } from '../../lib/webpush.js';

export const pushRouter = router({
  subscribe: clerkAuthedProcedure
    .meta({
      openapi: {
        method: 'POST',
        path: '/push/subscribe',
        description: 'Registers or refreshes a Web Push subscription for the authenticated user. Accepts the push endpoint URL and the VAPID encryption keys (p256dh and auth). Uses an upsert keyed on the endpoint so re-subscribing on the same device is idempotent. If a user switches devices, both subscriptions coexist until the old one expires (410 Gone) and is cleaned up.',
      },
    })
    .input(z.object({
      endpoint: z.string(),
      keys: z.object({
        p256dh: z.string(),
        auth: z.string(),
      })
    }))
    .output(z.object({
      success: z.boolean(),
      id:      z.string(),
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
    .meta({
      openapi: {
        method: 'DELETE',
        path: '/push/unsubscribe',
        description: 'Removes a Web Push subscription for the authenticated user by endpoint URL. Scoped to the calling user so that a user cannot unsubscribe another user\'s devices. Called automatically by the service worker when the user disables browser push notifications.',
      },
    })
    .input(z.object({
      endpoint: z.string()
    }))
    .output(z.object({
      success: z.boolean(),
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
    .meta({
      openapi: {
        method: 'POST',
        path: '/push/test',
        description: 'Development utility that sends a test Web Push notification to all active subscriptions of the authenticated user. Verifies the end-to-end push pipeline is working correctly. Automatically prunes any subscriptions that return a 410 Gone response, meaning the browser has invalidated the subscription (e.g. the user cleared site data).',
      },
    })
    .output(z.object({
      sent:         z.number(),
      successCount: z.number(),
    }))
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

      const results = await Promise.allSettled(subs.map(sub => 
        webpush.sendNotification({
          endpoint: sub.endpoint,
          keys: {
            p256dh: sub.p256dh,
            auth: sub.auth
          }
        }, payload)
      ));

      // Cleanup expired subscriptions (410 Gone)
      const failed = results.filter(r => r.status === 'rejected') as PromiseRejectedResult[];
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
