import { auth, getUserNotification } from '@/lib/firebase';
import { requestNotificationPermission, scheduleNotification } from '@/lib/notification';
import { router } from 'expo-router';
import 'fast-text-encoding';
import { onAuthStateChanged } from 'firebase/auth';
import { useEffect } from 'react';

export default function App() {
  useEffect(() => {
    requestNotificationPermission();

    const initializeNotification = async (userId: string) => {
      try {
        const notification = await getUserNotification(userId);
        if (notification) {
          scheduleNotification(notification.title, notification.body, notification.hour, notification.minute);
          console.log('Powiadomienie ustawione przy starcie aplikacji.');
        }
      } catch (error) {
        console.error('Błąd podczas ustawiania powiadomienia przy starcie:', error);
      }
    };

    const unsubscribe = onAuthStateChanged(auth, (currentUser) => {
      if (currentUser) {
        console.log("Zalogowany użytkownik:", currentUser.uid);
        initializeNotification(currentUser.uid);
        router.replace('/(tabs)/dashboard');
      } else {
        console.log("Nie zalogowano");
        router.replace('/login');
      }
    });

    return () => unsubscribe();
  }, []);

  return null;
}
