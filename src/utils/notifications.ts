import * as Notifications from 'expo-notifications';
import { Platform } from 'react-native';
import { Medication } from '@/types';
import { useAppStore } from '@/stores/useAppStore';
import i18n from '@/i18n';

// Configure notification handler
Notifications.setNotificationHandler({
  handleNotification: async () => {
    const { reminderSound } = useAppStore.getState();
    return {
      shouldShowAlert: true,
      shouldPlaySound: reminderSound !== 'none',
      shouldSetBadge: false,
      shouldShowBanner: true,
      shouldShowList: true,
    };
  },
});

/**
 * Request notification permission.
 * @param onDenied Optional callback when permission is denied. If provided, the custom modal
 *   should be shown by the caller. If not provided, fails silently.
 * @returns true if permission granted, false otherwise.
 */
export async function requestNotificationPermission(
  onDenied?: () => void
): Promise<boolean> {
  const { status: existingStatus } = await Notifications.getPermissionsAsync();
  let finalStatus = existingStatus;

  if (existingStatus !== 'granted') {
    const { status } = await Notifications.requestPermissionsAsync();
    finalStatus = status;
  }

  if (finalStatus !== 'granted') {
    onDenied?.();
    return false;
  }

  return true;
}

export async function scheduleNotificationsForMed(med: Medication): Promise<void> {
  // Cancel existing ones for this med first
  await cancelNotificationsForMed(med.id);

  const hasPermission = await Notifications.getPermissionsAsync();
  console.log('[Notifications] Permission status:', hasPermission.status);
  if (hasPermission.status !== 'granted') {
    console.log('[Notifications] Permission not granted, skipping schedule for', med.name);
    return;
  }

  const { earlyReminder, reminderSound } = useAppStore.getState();
  const soundEnabled = reminderSound !== 'none';

  for (const time of med.reminderTimes) {
    const [hours, minutes] = time.split(':').map(Number);

    // Apply early reminder offset
    let adjustedMinutes = minutes - earlyReminder;
    let adjustedHours = hours;
    if (adjustedMinutes < 0) {
      adjustedMinutes += 60;
      adjustedHours -= 1;
      if (adjustedHours < 0) {
        adjustedHours = 23;
      }
    }

    try {
      const notifId = await Notifications.scheduleNotificationAsync({
        content: {
          title: i18n.t('notifications.title', { name: med.name }),
          body: i18n.t('notifications.body', { dosage: med.dosage, unit: med.unit }),
          data: { medicationId: med.id },
          sound: soundEnabled ? 'default' : undefined,
        },
        trigger: {
          type: Notifications.SchedulableTriggerInputTypes.DAILY,
          hour: adjustedHours,
          minute: adjustedMinutes,
        },
      });
      console.log(`[Notifications] Scheduled for ${med.name} at ${adjustedHours}:${String(adjustedMinutes).padStart(2, '0')}, id: ${notifId}`);
    } catch (err) {
      console.error(`[Notifications] Failed to schedule for ${med.name} at ${adjustedHours}:${String(adjustedMinutes).padStart(2, '0')}:`, err);
    }
  }
}

export async function cancelNotificationsForMed(medId: string): Promise<void> {
  const scheduled = await Notifications.getAllScheduledNotificationsAsync();
  for (const notif of scheduled) {
    if (notif.content.data?.medicationId === medId) {
      await Notifications.cancelScheduledNotificationAsync(notif.identifier);
    }
  }
}

export async function cancelAllNotifications(): Promise<void> {
  await Notifications.cancelAllScheduledNotificationsAsync();
}
