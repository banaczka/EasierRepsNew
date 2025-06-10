import { useRouter } from "expo-router";
import React, { useState } from 'react';
import { Alert, ScrollView, StyleSheet, Text, TextInput, TouchableOpacity, View } from 'react-native';
import { SafeAreaView } from "react-native-safe-area-context";
import { savePlanToFirestore } from '../lib/firebase';

interface Exercise {
  name: string;
  sets: number;
  repsRange: string;
}

const router = useRouter();

const daysOfWeek = ["Pn", "Wt", "Śr", "Czw", "Pt", "Sb", "Nd"];

export default function NewPlanScreen() {
  const [planName, setPlanName] = useState('');
  const [selectedDays, setSelectedDays] = useState<string[]>([]);
  const [exercises, setExercises] = useState<Exercise[]>([]);
  const [exerciseName, setExerciseName] = useState('');
  const [sets, setSets] = useState('');
  const [repsMin, setRepsMin] = useState('');
  const [repsMax, setRepsMax] = useState('');

  const toggleDay = (day: string) => {
    if (selectedDays.includes(day)) {
      setSelectedDays(selectedDays.filter(d => d !== day));
    } else {
      setSelectedDays([...selectedDays, day]);
    }
  };

  const removeExercise = (index: number) => {
    setExercises(exercises.filter((_, i) => i !== index));
  };

  const isExerciseValid = () => {
    const setsNum = parseInt(sets);
    const repsMinNum = parseInt(repsMin);
    const repsMaxNum = parseInt(repsMax);

    if (!exerciseName || isNaN(setsNum) || isNaN(repsMinNum) || isNaN(repsMaxNum)) {
      Alert.alert('Błąd', 'Nieprawidłowe dane, sprawdź nazwe planu i liczbe serii lub powtórzeń');
      return false;
    }
    if (setsNum <= 0 || repsMinNum <= 0 || repsMaxNum <= 0) {
      Alert.alert('Błąd', 'Wartości muszą być większe od zera');
      return false;
    }
    if (repsMinNum > repsMaxNum) {
      Alert.alert('Błąd', 'Minimalna liczba powtórzeń nie może być większa od maksymalnej');
      return false;
    }
    return true;
  };

  const addExercise = () => {
    if (!isExerciseValid()) return;

    const newExercise: Exercise = {
      name: exerciseName,
      sets: parseInt(sets),
      repsRange: `${repsMin}-${repsMax}`,
    };

    setExercises([...exercises, newExercise]);
    setExerciseName('');
    setSets('');
    setRepsMin('');
    setRepsMax('');
  };

  const handleSavePlan = async () => {
    if (!planName || selectedDays.length === 0 || exercises.length === 0) {
      Alert.alert('Błąd', 'Uzupełnij wszystkie pola');
      return;
    }

    try {
      const planId = await savePlanToFirestore(planName, selectedDays, exercises);
      if (!planId) {
        Alert.alert('Ostrzeżenie', 'Plan o takiej nazwie już istnieje');
        return;
      }
      Alert.alert('Sukces', 'Plan został zapisany!');
      setPlanName('');
      setSelectedDays([]);
      setExercises([]);
      router.replace('/(tabs)/workouts');
    } catch (error: unknown) {
      if (error instanceof Error) {
        Alert.alert('Błąd zapisu', error.message);
      } else {
        Alert.alert('Błąd', 'Wystąpił nieznany błąd');
      }
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView contentContainerStyle={styles.scrollContent}>
        <Text style={styles.title}>Nazwa planu</Text>
        <TextInput
          placeholder='np. Trening górnej części ciała'
          value={planName}
          onChangeText={setPlanName}
          style={styles.input}
        />

        <Text style={styles.subtitle}>Wybierz dni tygodnia</Text>
        <View style={styles.daysContainer}>
          {daysOfWeek.map((day) => (
            <TouchableOpacity
              key={day}
              style={[styles.dayButton, selectedDays.includes(day) && styles.selectedDayButton]}
              onPress={() => toggleDay(day)}
            >
              <Text style={styles.dayButtonText}>{day}</Text>
            </TouchableOpacity>
          ))}
        </View>

        <Text style={styles.subtitle}>Dodaj ćwiczenia</Text>
        <TextInput placeholder='Nazwa ćwiczenia' value={exerciseName} onChangeText={setExerciseName} style={styles.input} />
        <TextInput placeholder='Liczba serii' value={sets} onChangeText={setSets} style={styles.input} keyboardType='numeric' />
        <TextInput placeholder='Min powtórzeń' value={repsMin} onChangeText={setRepsMin} style={styles.input} keyboardType='numeric' />
        <TextInput placeholder='Max powtórzeń' value={repsMax} onChangeText={setRepsMax} style={styles.input} keyboardType='numeric' />

        <TouchableOpacity style={styles.button} onPress={addExercise}>
          <Text style={styles.buttonText}>Dodaj ćwiczenie</Text>
        </TouchableOpacity>

        <Text style={styles.subtitle}>Ćwiczenia w planie</Text>
        {exercises.map((exercise, index) => (
          <View key={index} style={styles.exerciseContainer}>
            <Text style={styles.exercise}>{exercise.name} - liczba serii: {exercise.sets} ({exercise.repsRange} powtórzeń)</Text>
            <TouchableOpacity onPress={() => removeExercise(index)} style={styles.removeButton}>
              <Text style={styles.removeButtonText}>Usuń</Text>
            </TouchableOpacity>
          </View>
        ))}

        <TouchableOpacity style={styles.saveButton} onPress={handleSavePlan}>
          <Text style={styles.buttonText}>Zapisz plan</Text>
        </TouchableOpacity>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 20,
    backgroundColor: '#121212',
  },
  scrollContent: {
    paddingBottom: 20,
  },
  title: {
    fontSize: 24,
    color: '#fff',
    marginBottom: 10,
  },
  subtitle: {
    fontSize: 18,
    color: '#fff',
    marginVertical: 10,
    textAlign:'center',
    fontWeight:'bold'
  },
  input: {
    backgroundColor: '#333',
    color: '#fff',
    padding: 10,
    marginVertical: 5,
    borderRadius: 8,
  },
  daysContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    marginVertical: 10,
  },
  dayButton: {
    backgroundColor: '#444',
    padding: 10,
    margin: 5,
    borderRadius: 8,
  },
  selectedDayButton: {
    backgroundColor: '#6200ee',
  },
  dayButtonText: {
    color: '#fff',
  },
  button: {
    backgroundColor: '#10b981',
    padding: 15,
    borderRadius: 8,
    alignItems: 'center',
    marginVertical: 5,
  },
  saveButton: {
    backgroundColor: '#6200ee',
    padding: 15,
    borderRadius: 8,
    alignItems: 'center',
    marginTop: 20,
  },
  buttonText: {
    color: '#fff',
    fontSize: 16,
  },
  exercise: {
    color: '#fff',
    fontSize: 16,
    marginRight: 10,
    width: '75%'
  },
  exerciseContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 10,
    marginVertical: 5,
    backgroundColor: '#1e1e1e',
    borderRadius: 8,
    justifyContent: 'space-between',
  },
  removeButton: {
    backgroundColor: '#ff4d4d',
    paddingVertical: 4,
    paddingHorizontal: 8,
    borderRadius: 6,
  },
  removeButtonText: {
    color: '#fff',
    fontWeight: 'bold',
  },
});