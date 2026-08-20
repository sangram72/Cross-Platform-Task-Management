
import notifee, {
  TriggerType,
  AndroidImportance,
  TimestampTrigger,
} from '@notifee/react-native';
import { getMessaging, deleteToken } from '@react-native-firebase/messaging';
import { Platform } from 'react-native';

const CHANNEL_ID = 'task_reminders';

export class NotificationService {
  static async init() {
    await notifee.requestPermission();

    if (Platform.OS === 'android') {
      await notifee.createChannel({
        id: CHANNEL_ID,
        name: 'Task Reminders',
        importance: AndroidImportance.HIGH,
      });
    }
  }

  static async scheduleReminder(id: string, title: string, triggerTimestamp: number) {
    if (triggerTimestamp <= Date.now()) return;

    const trigger: TimestampTrigger = {
      type: TriggerType.TIMESTAMP,
      timestamp: triggerTimestamp,
    };

    await notifee.createTriggerNotification(
      {
        id,
        title: 'Task Reminder',
        body: title,
        android: {
          channelId: CHANNEL_ID,
          pressAction: { id: 'default' },
        },
      },
      trigger
    );
  }

  static async cancelReminder(notificationId: string) {
    try {
      await notifee.cancelNotification(notificationId);
    } catch (e) {
      console.error('Error cancelling notification:', e);
    }
  }

  static async cancelAllReminders() {
    try {
      // 1. Cancel all scheduled and displayed local reminders on device
      await notifee.cancelAllNotifications();

      // 2. Delete FCM device token to invalidate remote background push
      const messagingInstance = getMessaging();
      await deleteToken(messagingInstance);
    } catch (e) {
      console.error('Error clearing notifications on logout:', e);
    }
  }
}