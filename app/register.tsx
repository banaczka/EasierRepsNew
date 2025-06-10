import { auth } from '@/lib/firebase';
import { useRouter } from 'expo-router';
import { createUserWithEmailAndPassword } from 'firebase/auth';
import { useState } from 'react';
import {
  Alert,
  StyleSheet,
  Text, TextInput, TouchableOpacity,
  View
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

export default function RegisterScreen() {
  const router = useRouter();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirm, setConfirm] = useState('');

  const handleRegister = async () => {
    if (!email || !password || password !== confirm) {
      Alert.alert('Błąd', 'Uzupełnij poprawnie wszystkie pola');
      return;
    }

    try {
      const user = await createUserWithEmailAndPassword(auth, email, password);
      if (user) {
        Alert.alert('Sukces', 'Konto zostało utworzone');
        router.replace('/(tabs)/dashboard');
      }
    } catch (error: any) {
      Alert.alert('Błąd rejestracji', error.message);
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.card}>
        <Text style={styles.title}>Rejestracja</Text>

        <TextInput
          placeholder="Email"
          style={styles.input}
          value={email}
          onChangeText={setEmail}
          placeholderTextColor="#aaa"
          autoCapitalize="none"
          keyboardType="email-address"
        />
        <TextInput
          placeholder="Hasło"
          style={styles.input}
          value={password}
          onChangeText={setPassword}
          secureTextEntry
          placeholderTextColor="#aaa"
        />
        <TextInput
          placeholder="Potwierdź hasło"
          style={styles.input}
          value={confirm}
          onChangeText={setConfirm}
          secureTextEntry
          placeholderTextColor="#aaa"
        />

        <TouchableOpacity style={styles.button} onPress={handleRegister}>
          <Text style={styles.buttonText}>Zarejestruj się</Text>
        </TouchableOpacity>
        <TouchableOpacity onPress={() => router.replace('/')} style={styles.link}>
        <Text style={styles.linkText}>Masz już konto? Zaloguj się</Text>
      </TouchableOpacity>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    padding: 24,
    backgroundColor: '#121212',
    alignItems: 'center',
  },
  card: {
    backgroundColor: '#1e1e1e',
    borderRadius: 16,
    padding: 24,
    width: '90%',
    alignItems: 'center',
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 24,
    textAlign: 'center',
    color: '#fff',
  },
  input: {
    height: 48,
    width: '100%',
    borderColor: '#333',
    borderWidth: 1,
    borderRadius: 12,
    paddingHorizontal: 12,
    marginBottom: 16,
    color: '#fff',
    backgroundColor: '#2c2c2c',
  },
  button: {
    backgroundColor: '#10b981',
    paddingVertical: 14,
    borderRadius: 12,
    alignItems: 'center',
    width: '100%',
    marginTop: 10,
  },
  buttonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
  },
  link: {
    marginTop: 20,
  },
  linkText: {
    color: '#10b981',
    fontSize: 16,
    textDecorationLine: 'underline',
  },
});