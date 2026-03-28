import { prisma } from './prisma.js';
import { webpush } from './webpush.js';
export async function sendPushNotification(userId, payload) {
    try {
        const subs = await prisma.pushSubscription.findMany({
            where: { userId }
        });
        if (subs.length === 0)
            return;
        const pushPayload = JSON.stringify(payload);
        const results = await Promise.allSettled(subs.map(sub => webpush.sendNotification({
            endpoint: sub.endpoint,
            keys: {
                p256dh: sub.p256dh,
                auth: sub.auth
            }
        }, pushPayload)));
        // Cleanup expired
        const failed = results.filter(r => r.status === 'rejected');
        for (const fail of failed) {
            if (fail.reason?.statusCode === 410) {
                await prisma.pushSubscription.deleteMany({
                    where: { endpoint: fail.reason.endpoint }
                });
            }
        }
    }
    catch (error) {
        console.error('Error sending push notification:', error);
    }
}
//# sourceMappingURL=push.js.map