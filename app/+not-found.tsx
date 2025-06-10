import { Link, Stack } from "expo-router"
import { StyleSheet, Text, View } from "react-native"

export default function NotFoundScreen() {
  return (
    <>
      <Stack.Screen options={{ title: "Oops!" }} />
      <View style={styles.container}>
        <Text style={styles.title}>Ta strona nie istnieje.</Text>
        <Link href="/" style={styles.link}>
          <Text style={styles.linkText}>Przejdź do strony głównej!</Text>
        </Link>
      </View>
    </>
  )
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    padding: 24,
    backgroundColor: "#121212",
  },
  title: {
    fontSize: 24,
    fontWeight: "bold",
    color: "#fff",
    marginBottom: 16,
    textAlign: "center",
  },
  link: {
    marginTop: 20,
    paddingVertical: 15,
    backgroundColor: "#10b981",
    paddingHorizontal: 24,
    borderRadius: 12,
  },
  linkText: {
    color: "#fff",
    fontSize: 16,
    fontWeight: "600",
  },
})
