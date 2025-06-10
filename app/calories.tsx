import { deleteMeal, getTodayMeals, saveMealToFirestore } from '@/lib/firebase';
import { fetchCalories } from '@/lib/nutrition';
import React, { useEffect, useState } from 'react';
import { Alert, ScrollView, StyleSheet, Text, TextInput, TouchableOpacity, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

export default function CaloriesScreen() {
  const [food, setFood] = useState('');
  const [quantity, setQuantity] = useState('');
  const [calories, setCalories] = useState<number | null>(null);
  const [todayCalories, setTodayCalories] = useState(0);
  const [meals, setMeals] = useState<any[]>([]);

  useEffect(() => {
    const loadMeals = async () => {
      try {
        const mealsData = await getTodayMeals();
        setMeals(mealsData);

        const totalCalories = mealsData.reduce((sum, meal) => sum + meal.calories, 0);
        setTodayCalories(totalCalories);
      } catch (error) {
        console.error("Błąd ładowania posiłków:", error);
      }
    };
    loadMeals();
  }, []);

  const handleFetchCalories = async () => {
    if (!/^\d+$/.test(quantity)) {
      Alert.alert('Błąd', 'Ilość musi być liczbą całkowitą większą od zera.');
      return;
    }
    const parsedQuantity = parseInt(quantity, 10);
    if (!food || !quantity) {
      Alert.alert('Błąd', 'Podaj produkt i ilość.');
      return;
    }

    if (isNaN(parsedQuantity) || parsedQuantity <= 0) {
      Alert.alert('Błąd', 'Ilość musi być liczbą całkowitą większą od zera.');
      return;
    }
  
    try {
      const cal = await fetchCalories(food, parsedQuantity);
      if (cal === null) {
        Alert.alert('Błąd', 'Nie znaleziono produktu w bazie danych.');
        return;
      }
      setCalories(cal);
      const saveResult = await saveMealToFirestore(food, cal);
      if (saveResult !== null) {
        Alert.alert('Zapisano!', `Dodano ${food} (${cal} kcal)`);
        const mealsData = await getTodayMeals();
        setMeals(mealsData);
        setTodayCalories((prev) => prev + cal);
      } else {
        Alert.alert('Błąd', 'Nie udało się zapisać posiłku.');
      }
    } catch (error: any) {
      console.error('Błąd:', error.message);
      Alert.alert('Błąd', 'Wystąpił problem z połączeniem.');
    }
  };

  const handleDeleteMeal = async (mealId: string) => {
    try {
      await deleteMeal(mealId);
      const mealsData = await getTodayMeals();
      setMeals(mealsData);
      const totalCalories = mealsData.reduce((sum, meal) => sum + meal.calories, 0);
      setTodayCalories(totalCalories);
      Alert.alert('Sukces', 'Posiłek został usunięty.');
    } catch (error) {
      Alert.alert('Błąd', 'Nie udało się usunąć posiłku.');
      console.error("Błąd usuwania posiłku:", error);
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView contentContainerStyle={styles.scrollContent} keyboardShouldPersistTaps="handled">
      <View style={styles.summaryCard}>
        <Text style={styles.summaryTitle}>Dzisiejsze kalorie</Text>
        <View style={styles.calorieRow}>
          <Text style={styles.calorieValue}>{todayCalories}</Text>
          <Text style={styles.calorieUnit}>kcal</Text>
        </View>
      </View>

      <View style={styles.card}>
        <Text style={styles.cardTitle}>Dodaj posiłek</Text>
        <TextInput
          placeholder="Nazwa produktu (w języku angielskim)"
          value={food}
          onChangeText={setFood}
          style={styles.input}
          placeholderTextColor="#888"
        />
        <TextInput
          placeholder="Ilość (g)"
          value={quantity}
          onChangeText={setQuantity}
          keyboardType="numeric"
          style={styles.input}
          placeholderTextColor="#888"
        />
        <TouchableOpacity style={styles.button} onPress={handleFetchCalories}>
          <Text style={styles.buttonText}>Dodaj</Text>
        </TouchableOpacity>
      </View>

      <View style={styles.mealsSection}>
        <Text style={styles.cardTitle}>Dzisiejsze posiłki</Text>
        {meals.length === 0 ? (
          <Text style={styles.noMeals}>Brak zapisanych posiłków.</Text>
        ) : (
          meals.map((item) => (
            <View key={item.id} style={styles.mealItem}>
              <View>
                <Text style={styles.mealName}>{item.name}</Text>
                <Text style={styles.mealCalories}>{item.calories} kcal</Text>
              </View>
              <TouchableOpacity
                onPress={() => handleDeleteMeal(item.id)}
                style={styles.deleteButton}
              >
                <Text style={styles.deleteButtonText}>Usuń</Text>
              </TouchableOpacity>
            </View>
          ))
        )}
      </View>
    </ScrollView>
  </SafeAreaView>
);
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#121212',
    padding: 20,
  },
  summaryCard: {
    backgroundColor: '#10b981',
    borderRadius: 16,
    padding: 24,
    alignItems: 'center',
    marginBottom: 24,
  },
  summaryTitle: {
    fontSize: 18,
    color: '#fff',
    opacity: 0.9,
    marginBottom: 8,
  },
  calorieRow: {
    flexDirection: 'row',
    alignItems: 'flex-end',
  },
  calorieValue: {
    fontSize: 48,
    color: '#fff',
    fontWeight: '700',
  },
  calorieUnit: {
    fontSize: 20,
    color: '#fff',
    marginLeft: 4,
    marginBottom: 6,
    opacity: 0.8,
  },
  card: {
    backgroundColor: '#1e1e1e',
    borderRadius: 12,
    padding: 20,
    marginBottom: 24,
  },
  cardTitle: {
    fontSize: 18,
    color: '#fff',
    marginBottom: 16,
  },
  input: {
    backgroundColor: '#2c2c2c',
    color: '#fff',
    padding: 12,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#333',
    marginBottom: 12,
    fontSize: 16,
  },
  button: {
    backgroundColor: '#3498db',
    padding: 14,
    borderRadius: 8,
    alignItems: 'center',
  },
  buttonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
  },
  mealsSection: {
    flex: 1,
  },
  noMeals: {
    color: '#aaa',
    textAlign: 'center',
    fontStyle: 'italic',
    marginTop: 20,
  },
  mealItem: {
    backgroundColor: '#1e1e1e',
    padding: 16,
    borderRadius: 8,
    marginBottom: 10,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  mealName: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '500',
    marginBottom: 4,
  },
  mealCalories: {
    color: '#10b981',
    fontSize: 14,
    fontWeight: '500',
  },
  deleteButton: {
    backgroundColor: '#ff4d4d',
    paddingVertical: 6,
    paddingHorizontal: 12,
    borderRadius: 6,
  },
  deleteButtonText: {
    color: '#fff',
    fontWeight: '600',
  },
  scrollContent: {
    paddingBottom: 40,
  },
  
});