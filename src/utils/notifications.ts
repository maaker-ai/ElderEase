import * as Notifications from 'expo-notifications';
import { Platform, Alert, Linking } from 'react-native';
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

export async function requestNotificationPermission(): Promise<boolean> {
  const { status: existingStatus } = await Notifications.getPermissionsAsync();
  let finalStatus = existingStatus;

  if (existingStatus !== 'granted') {
    const { status } = await Notifications.requestPermissionsAsync();
    finalStatus = status;
  }

  if (finalStatus !== 'granted') {
    Alert.alert(
      i18n.t('permissions.deniedTitle'),
      i18n.t('permissions.deniedMessage'),
      [
        { text: i18n.t('common.cancel'), style: 'cancel' },
        { text: i18n.t('permissions.openSettings'), onPress: () => Linking.openSettings() },
      ]
    );
    return false;
  }

  return true;
}

export async function scheduleNotificationsForMed(med: Medication): Promise<void> {
  // Cancel existing ones for this med first
  await cancelNotificationsForMed(med.id);

  const hasPermission = await Notifications.getPermissionsAsync();
  if (hasPermission.status !== 'granted') return;

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

    await Notifications.scheduleNotificationAsync({
      content: {
        title: i18n.t('notifications.title', { name: med.name }),
        body: i18n.t('notifications.body', { dosage: med.dosage, unit: med.unit }),
        data: { medicationId: med.id },
        sound: soundEnabled,
      },
      trigger: {
        type: Notifications.SchedulableTriggerInputTypes.DAILY,
        hour: adjustedHours,
        minute: adjustedMinutes,
      },
    });
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
