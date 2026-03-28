import webpush from 'web-push';
import * as dotenv from 'dotenv';
dotenv.config();
const VAPID_PUBLIC_KEY = process.env.NEXT_PUBLIC_VAPID_PUBLIC_KEY || '';
const VAPID_PRIVATE_KEY = process.env.VAPID_PRIVATE_KEY || '';
const SUBJECT = process.env.VAPID_SUBJECT || 'mailto:admin@sajilokheti.com';
if (VAPID_PUBLIC_KEY && VAPID_PRIVATE_KEY) {
    webpush.setVapidDetails(SUBJECT, VAPID_PUBLIC_KEY, VAPID_PRIVATE_KEY);
}
else {
    console.warn("⚠️ Web Push keys are missing from environment variables.");
}
export { webpush };
//# sourceMappingURL=webpush.js.map