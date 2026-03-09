import * as Sentry from '@sentry/react-native';

const DSN = process.env.EXPO_PUBLIC_SENTRY_DSN ?? '';
const ENV = process.env.EXPO_PUBLIC_ENV ?? 'development';

export function initSentry(): void {
  if (!DSN) {
    console.warn('[Sentry] DSN not configured — monitoring disabled.');
    return;
  }

  Sentry.init({
    dsn: DSN,
    environment: ENV,
    debug: ENV === 'development',
    tracesSampleRate: ENV === 'production' ? 0.2 : 1.0,
    enableNativeFramesTracking: true,
  });
}

export function setSentryUser(user: { id: string; email: string; name?: string } | null): void {
  if (user) {
    Sentry.setUser({ id: user.id, email: user.email, username: user.name });
  } else {
    Sentry.setUser(null);
  }
}

export function captureError(error: unknown, context?: Record<string, unknown>): void {
  if (context) {
    Sentry.withScope((scope) => {
      scope.setExtras(context);
      Sentry.captureException(error);
    });
  } else {
    Sentry.captureException(error);
  }
}

export { Sentry };
