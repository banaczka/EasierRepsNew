import { auth } from '@/lib/firebase';
import { cancelAllNotifications } from '@/lib/notification';
import { useRouter } from 'expo-router';
import { getAuth, onAuthStateChanged, signOut } from 'firebase/auth';
import React, { useEffect, useState } from 'react';
import { Alert, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

export default function ProfileScreen() {
  const router = useRouter();
  const [username, setUsername] = useState<string | null>(null);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(getAuth(), (user) => {
      if (user && user.email) {
        const extractedUsername = user.email.split('@')[0];
        setUsername(extractedUsername);
      } else {
        router.replace('/login');
      }
    });
    return unsubscribe;
  }, []);

  const handleLogout = async () => {
    try {
      await cancelAllNotifications();
      await signOut(auth);
      Alert.alert('Wylogowano', 'Zostałeś wylogowany pomyślnie.');
      router.replace('/login');
    } catch (error) {
      Alert.alert('Błąd', 'Nie udało się wylogować.');
      console.error('Błąd wylogowania:', error);
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      <Text style={styles.title}>Profil Użytkownika {username}</Text>
      <View style={styles.menuContainer}>
        <TouchableOpacity style={styles.menuItem} onPress={() => router.push('/history')}>
          <Text style={styles.menuText}>Historia treningów</Text>
        </TouchableOpacity>
        <TouchableOpacity style={styles.menuItem} onPress={() => router.push('/calories')}>
          <Text style={styles.menuText}>Licznik Kalorii</Text>
        </TouchableOpacity>
        <TouchableOpacity style={styles.menuItem} onPress={() => router.push('/set-reminder')}>
          <Text style={styles.menuText}>Ustaw przypomnienie o suplementach</Text>
        </TouchableOpacity>
        <TouchableOpacity style={styles.logoutItem} onPress={handleLogout}>
          <Text style={styles.menuText}>Wyloguj się</Text>
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 24,
    backgroundColor: '#121212',
    justifyContent: 'flex-start',
    alignItems: 'center',
    paddingTop: 60,
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 30,
    color: '#fff',
    textAlign: 'center',
  },
  menuContainer: {
    width: '100%',
    maxWidth: 400,
  },
  menuItem: {
    backgroundColor: '#1e1e1e',
    padding: 18,
    marginVertical: 6,
    alignItems: 'center',
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#333',
  },
  logoutItem: {
    backgroundColor: '#6200ee',
    padding: 18,
    marginVertical: 6,
    alignItems: 'center',
    borderRadius: 12,
    marginTop: 20,
  },
  menuText: {
    color: '#fff',
    fontSize: 16,
    textAlign: 'center',
    fontWeight: '500',
  },
});