import * as Sentry from '@sentry/nextjs';

const dsn = process.env.NEXT_PUBLIC_SENTRY_DSN;

if (dsn) {
  Sentry.init({
    dsn,
    environment: process.env.NODE_ENV,
    // Crash reporting is the goal; performance traces are sampled thinly.
    tracesSampleRate: 0.1,
    // Expense text is personal — never record the screen or form contents.
    replaysSessionSampleRate: 0,
    replaysOnErrorSampleRate: 0,
    sendDefaultPii: false,
    integrations: (defaults) => defaults.filter((integration) => integration.name !== 'Replay'),
  });
}

export const onRouterTransitionStart = Sentry.captureRouterTransitionStart;
