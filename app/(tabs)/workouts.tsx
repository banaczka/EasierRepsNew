import { deletePlan, getUserPlans } from '@/lib/firebase';
import { useFocusEffect } from '@react-navigation/native';
import { useRouter } from 'expo-router';
import React, { useCallback, useState } from 'react';
import { Alert, FlatList, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

export default function WorkoutsScreen() {
  const router = useRouter();
  const [plans, setPlans] = useState<any[]>([]);

  const loadPlans = async () => {
    try {
      const userPlans = await getUserPlans();
      setPlans(userPlans);
    } catch (error) {
      console.error('Błąd ładowania planów:', error);
      Alert.alert('Błąd', 'Nie udało się załadować planów.');
    }
  };

  useFocusEffect(
    useCallback(() => {
      loadPlans();
    }, [])
  );

  const handleDeletePlan = async (planId: string) => {
    Alert.alert(
      'Usuń plan',
      'Czy na pewno chcesz usunąć ten plan?',
      [
        { text: 'Anuluj', style: 'cancel' },
        {
          text: 'Usuń',
          style: 'destructive',
          onPress: async () => {
            try {
              await deletePlan(planId);
              loadPlans();
            } catch (error) {
              Alert.alert('Błąd', 'Nie udało się usunąć planu.');
            }
          }
        }
      ]
    );
  };

  return (
    <SafeAreaView style={styles.container}>
      <Text style={styles.title}>Twoje plany treningowe</Text>

      <TouchableOpacity style={styles.button} onPress={() => router.push('/new-plan')}>
        <Text style={styles.buttonText}>Stwórz nowy plan</Text>
      </TouchableOpacity>

      {plans.length === 0 ? (
        <Text style={styles.noPlans}>Brak zapisanych planów.</Text>
      ) : (
        <FlatList
          data={plans}
          keyExtractor={(item) => item.id}
          renderItem={({ item }) => (
            <View style={styles.planItem}>
              <Text style={styles.planName}>{item.name}</Text>
              <Text style={styles.planDays}>{item.days.join(', ')}</Text>
              <FlatList
                data={item.exercises}
                keyExtractor={(_, index) => index.toString()}
                renderItem={({ item }) => (
                  <Text style={styles.exercise}>{item.name} - liczba serii: {item.sets} ({item.repsRange} powtórzeń)</Text>
                )}
              />
              <TouchableOpacity
                style={styles.deleteButton}
                onPress={() => handleDeletePlan(item.id)}
              >
                <Text style={styles.deleteButtonText}>Usuń</Text>
              </TouchableOpacity>
            </View>
          )}
        />
      )}
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#121212',
    padding: 24,
  },
  title: {
    fontSize: 22,
    fontWeight: '600',
    color: '#fff',
    marginBottom: 16,
  },
  button: {
    backgroundColor: '#10b981',
    padding: 12,
    borderRadius: 8,
    alignItems: 'center',
    marginBottom: 16,
  },
  buttonText: {
    color: '#fff',
    fontSize: 16,
  },
  noPlans: {
    color: '#ccc',
    textAlign: 'center',
    marginTop: 20,
  },
  planItem: {
    backgroundColor: '#1e1e1e',
    padding: 16,
    borderRadius: 10,
    marginBottom: 12,
  },
  planName: {
    fontSize: 18,
    color: '#fff',
    marginBottom: 4,
  },
  planDays: {
    color: '#aaa',
  },
  exercise: {
    color: '#fff',
    marginTop: 2,
  },
  deleteButton: {
    backgroundColor: '#d9534f',
    padding: 8,
    borderRadius: 6,
    marginTop: 8,
    alignItems: 'center',
  },
  deleteButtonText: {
    color: '#fff',
    fontWeight: '600',
  },
});