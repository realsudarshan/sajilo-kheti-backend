
import { PostHog } from 'posthog-node';

export const posthog = new PostHog(process.env.POSTHOG_API_KEY!, {
  host: 'https://app.posthog.com',
  flushAt: 1, // flush immediately in dev, increase in prod
});