"use client"

import { auth, getUserNotification } from "@/lib/firebase"
import { scheduleNotification } from "@/lib/notification"
import { router } from "expo-router"
import "fast-text-encoding"
import { signInWithEmailAndPassword } from "firebase/auth"
import { useState } from "react"
import { Alert, StyleSheet, Text, TextInput, TouchableOpacity, View } from "react-native"
import { SafeAreaView } from "react-native-safe-area-context"

const index = () => {
  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")

  const signIn = async () => {
    try {
      const userCredential = await signInWithEmailAndPassword(auth, email, password)
      const user = userCredential.user
      if (user) {
        const notification = await getUserNotification(user.uid)
        if (notification) {
          scheduleNotification(notification.title, notification.body, notification.hour, notification.minute)
          console.log("Powiadomienie ustawione po zalogowaniu.")
        }
        router.replace("/(tabs)/dashboard")
      }
    } catch (error: any) {
      Alert.alert("Błąd logowania", "Nie udana próba logowania")
    }
  }

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.card}>
        <Text style={styles.title}>Logowanie</Text>

        <TextInput
          placeholder="Email"
          style={styles.input}
          value={email}
          onChangeText={setEmail}
          placeholderTextColor="#aaa"
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

        <TouchableOpacity style={styles.button} onPress={signIn}>
          <Text style={styles.buttonText}>Zaloguj się</Text>
        </TouchableOpacity>

        <TouchableOpacity onPress={() => router.push("/register")}>
          <Text style={styles.link}>Nie masz konta? Zarejestruj się</Text>
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  )
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: "center",
    padding: 24,
    backgroundColor: "#121212",
  },
  card: {
    backgroundColor: "#1e1e1e",
    borderRadius: 16,
    padding: 24,
    marginBottom: 24,
  },
  title: {
    fontSize: 28,
    fontWeight: "600",
    marginBottom: 24,
    textAlign: "center",
    color: "#fff",
  },
  input: {
    height: 50,
    borderColor: "#333",
    borderWidth: 1,
    borderRadius: 12,
    paddingHorizontal: 12,
    marginBottom: 16,
    color: "#fff",
    backgroundColor: "#2c2c2c",
  },
  button: {
    backgroundColor: "#6200ee",
    paddingVertical: 14,
    borderRadius: 12,
    alignItems: "center",
    marginBottom: 12,
  },
  buttonText: {
    color: "#fff",
    fontSize: 18,
    fontWeight: "600",
  },
  link: {
    color: "#10b981",
    fontSize: 16,
    marginTop: 16,
    textAlign: "center",
    textDecorationLine: "underline",
  },
})

export default index
