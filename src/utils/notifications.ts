import * as Notifications from 'expo-notifications';
import { Platform, Alert, Linking } from 'react-native';
import { Medication } from '@/types';
import i18n from '@/i18n';

// Configure notification handler
Notifications.setNotificationHandler({
  handleNotification: async () => ({
    shouldShowAlert: true,
    shouldPlaySound: true,
    shouldSetBadge: false,
    shouldShowBanner: true,
    shouldShowList: true,
  }),
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

  for (const time of med.reminderTimes) {
    const [hours, minutes] = time.split(':').map(Number);

    await Notifications.scheduleNotificationAsync({
      content: {
        title: i18n.t('notifications.title', { name: med.name }),
        body: i18n.t('notifications.body', { dosage: med.dosage, unit: med.unit }),
        data: { medicationId: med.id },
      },
      trigger: {
        type: Notifications.SchedulableTriggerInputTypes.DAILY,
        hour: hours,
        minute: minutes,
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
