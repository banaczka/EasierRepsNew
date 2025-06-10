import { deleteUserNotification, getUserNotification, saveNotification } from '@/lib/firebase';
import { cancelAllNotifications, scheduleNotification } from '@/lib/notification';
import 'fast-text-encoding';
import { getAuth } from 'firebase/auth';
import React, { useEffect, useState } from 'react';
import { Alert, StyleSheet, Text, TextInput, TouchableOpacity, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

const SetReminder = () => {
    const [body, setBody] = useState('');
    const [hour, setHour] = useState('');
    const [minute, setMinute] = useState('');
    const [existingReminder, setExistingReminder] = useState<string | null>(null);

    useEffect(() => {
        const loadReminder = async () => {
            try {
                const user = getAuth().currentUser;
                if (!user) {
                console.log('nie ma usera');
                return;
                }
                const userId = user.uid;
                const reminder = await getUserNotification(userId);
                if (reminder) {
                    setExistingReminder(`${reminder.body} o ${reminder.hour}:${reminder.minute}`);
                console.log('Wczytano przypomnienie:', reminder);
                }
            } catch (error) {
                console.error('Błąd podczas ładowania przypomnienia:', error);
            }
        };
        loadReminder();
    }, []);

    const handleSave = async () => {
        try {

            const parsedHour = parseInt(hour, 10);
            const parsedMinute = parseInt(minute, 10);

            if (!body.trim()) {
                Alert.alert('Błąd', 'Podaj treść przypomnienia.');
                return;
              }

            if (!/^\d+$/.test(hour) || isNaN(parsedHour) || parsedHour < 0 || parsedHour > 23) {
                Alert.alert('Błąd', 'Godzina musi być liczbą całkowitą od 0 do 23.');
                return;
            }

            if (!/^\d+$/.test(minute) || isNaN(parsedMinute) || parsedMinute < 0 || parsedMinute > 59) {
                Alert.alert('Błąd', 'Minuty muszą być liczbą z zakresu 00-59.');
                return;
            }
            
            const user = getAuth().currentUser;
            if (!user) {
                Alert.alert('Błąd', 'Nie znaleziono ID użytkownika');
                return;
            }
            const userId = user.uid;
            const existing = await getUserNotification(userId);
            if (existing) {
                await deleteUserNotification(userId);
                console.log('Stare powiadomienie usunięte.');
            }
        
            const title = 'Przypomnienie o suplementach';
            const notificationHour = parseInt(hour);
            const notificationMinute = parseInt(minute);
        
            await saveNotification(title, body, notificationHour, notificationMinute);
            setExistingReminder(`${body} o ${hour}:${minute}`);
            Alert.alert('Sukces', 'Powiadomienie zapisane');
        
            scheduleNotification(title, body, notificationHour, notificationMinute);
        } catch (error) {
            Alert.alert('Błąd', 'Nie udało się zapisać powiadomienia');
            console.error(error);
        }
    };

  const handleCancel = async () => {
    try {
      await cancelAllNotifications();
      setExistingReminder(null);
      Alert.alert('Powiadomienie anulowane', 'Wszystkie powiadomienia zostały usunięte.');
      console.log('Powiadomienie anulowane.');
    } catch (error) {
      Alert.alert('Błąd', 'Nie udało się anulować powiadomienia');
      console.error('Błąd anulowania powiadomienia:', error);
    }
  };

  return (
    <SafeAreaView style={styles.container}>
        <Text style={styles.title}>Ustaw nowe przypomnienie</Text>
        {existingReminder && (
            <View style={styles.currentReminder}>
            <Text style={styles.currentReminderText}>Aktualne przypomnienie: {existingReminder}</Text>
            </View>
        )}
        <TouchableOpacity style={styles.cancelButton} onPress={handleCancel}>
            <Text style={styles.buttonText}>Anuluj Powiadomienie</Text>
        </TouchableOpacity>
        <TextInput
            style={styles.input}
            placeholder="Treść powiadomienia"
            placeholderTextColor="#888"
            value={body}
            onChangeText={setBody}
        />
        <TextInput
            style={styles.input}
            placeholder="Godzina (HH)"
            placeholderTextColor="#888"
            value={hour}
            onChangeText={setHour}
            keyboardType="numeric"
            maxLength={2}
        />
        <TextInput
            style={styles.input}
            placeholder="Minuta (MM)"
            placeholderTextColor="#888"
            value={minute}
            onChangeText={setMinute}
            keyboardType="numeric"
            maxLength={2}
        />
        <TouchableOpacity style={styles.button} onPress={handleSave}>
            <Text style={styles.buttonText}>Zapisz przypomnienie</Text>
        </TouchableOpacity>
        </SafeAreaView>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
        justifyContent: 'center',
        padding: 24,
        backgroundColor: '#121212',
    },
    title: {
        fontSize: 28,
        color: '#fff',
        marginBottom: 16,
        textAlign: 'center',
    },
    currentReminder: {
        marginBottom: 16,
        padding: 10,
        backgroundColor: '#1e1e1e',
        borderRadius: 8,
    },
    currentReminderText: {
        color: '#10b981',
        fontSize: 16,
    },
    input: {
        height: 50,
        borderColor: '#333',
        borderWidth: 1,
        borderRadius: 8,
        paddingHorizontal: 12,
        marginBottom: 16,
        color: '#fff',
        backgroundColor: '#2c2c2c',
    },
    button: {
        backgroundColor: '#6200ee',
        paddingVertical: 14,
        borderRadius: 8,
        alignItems: 'center',
    },
    buttonText: {
        color: '#fff',
        fontSize: 18,
    },
    cancelButton: {
        backgroundColor: '#F44336',
        padding: 12,
        marginVertical: 10,
        borderRadius: 5,
    },
});

export default SetReminder;