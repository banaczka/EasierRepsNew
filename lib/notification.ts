import notifee, { RepeatFrequency, TimestampTrigger, TriggerType } from '@notifee/react-native';

async function requestNotificationPermission() {
  try {
    const settings = await notifee.requestPermission();

    if (settings?.ios?.authorizationStatus === 1) {
      console.log('Powiadomienia zostały dozwolone');
    } else if (settings?.ios?.authorizationStatus === 2) {
      console.warn('Powiadomienia zostały tymczasowo dozwolone');
    } else if (settings?.ios?.authorizationStatus === 0) {
      console.warn('Powiadomienia zostały odrzucone');
    } else {
      console.log('Status powiadomień na Androidzie:', settings);
    }
  } catch (error) {
    console.error('Błąd podczas żądania zgody na powiadomienia:', error);
  }
}

function calculateNextTrigger(hour: number, minute: number): number {
  const now = new Date();
  const nextTrigger = new Date();

  nextTrigger.setHours(hour, minute, 0, 0);

  if (nextTrigger <= now) {
    nextTrigger.setDate(nextTrigger.getDate() + 1);
  }

  return nextTrigger.getTime();
}

async function scheduleNotification(title: string, body: string, hour: number, minute: number) {
  try {
    await notifee.createChannel({
      id: 'default',
      name: 'Default Channel',
    });

    const triggerTime = calculateNextTrigger(hour, minute);

    const trigger: TimestampTrigger = {
      type: TriggerType.TIMESTAMP,
      timestamp: triggerTime,
      repeatFrequency: RepeatFrequency.DAILY,
    };

    await notifee.cancelAllNotifications();

    await notifee.createTriggerNotification(
      {
        title: title,
        body: body,
        android: {
          channelId: 'default',
        },
      },
      trigger
    );

    console.log(`Powiadomienie ustawione na ${hour}:${minute}`);
  } catch (error) {
    console.error('Błąd ustawiania powiadomienia:', error);
  }
}

async function cancelAllNotifications() {
    try {
      await notifee.cancelAllNotifications();
      console.log('Wszystkie lokalne powiadomienia zostały anulowane.');
    } catch (error) {
      console.error('Błąd anulowania powiadomień:', error);
    }
  }

export { cancelAllNotifications, requestNotificationPermission, scheduleNotification };

