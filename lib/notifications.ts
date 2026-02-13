export const canUseNotifications = (): boolean => {
  if (typeof window === 'undefined') return false;
  return 'Notification' in window;
};

export const ensureNotificationPermission = async (): Promise<boolean> => {
  if (!canUseNotifications()) return false;
  if (Notification.permission === 'granted') return true;
  if (Notification.permission === 'denied') return false;
  try {
    const result = await Notification.requestPermission();
    return result === 'granted';
  } catch {
    return false;
  }
};

export const showNotification = async (
  title: string,
  options?: NotificationOptions
): Promise<void> => {
  const allowed = await ensureNotificationPermission();
  if (!allowed) return;
  new Notification(title, options);
};

export const maybeNotifyBudgetStatus = async (params: {
  year: number;
  month: number;
  percentage: number;
  spentLabel: string;
  limitLabel: string;
}) => {
  const { year, month, percentage, spentLabel, limitLabel } = params;
  if (!canUseNotifications()) return;

  const status =
    percentage >= 100 ? 'over' : percentage >= 90 ? 'near' : null;
  if (!status) return;

  const key = `budget-notified-${year}-${month}-${status}`;
  if (typeof window === 'undefined') return;
  const already = window.localStorage.getItem(key);
  if (already) return;

  await showNotification(
    status === 'over'
      ? 'You exceeded your monthly budget'
      : 'You are close to your monthly budget limit',
    {
      body:
        status === 'over'
          ? `You spent ${spentLabel} of your ${limitLabel} limit.`
          : `You have already spent ${spentLabel} of your ${limitLabel} limit.`,
      tag: `budget-${year}-${month}`,
      renotify: false,
    }
  );

  window.localStorage.setItem(key, '1');
};

