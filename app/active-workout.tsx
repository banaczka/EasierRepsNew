import { useFocusEffect } from '@react-navigation/native';
import { Audio } from 'expo-av';
import { useLocalSearchParams, useRouter } from 'expo-router';
import React, { useCallback, useEffect, useState } from 'react';
import { Alert, BackHandler, StyleSheet, Text, TextInput, TouchableOpacity, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { getUserPlans, saveWorkoutSession } from '../lib/firebase';

export default function ActiveWorkoutScreen() {
  const router = useRouter();
  const { planId } = useLocalSearchParams();
  const [exercises, setExercises] = useState<any[]>([]);
  const [currentExercise, setCurrentExercise] = useState(0);
  const [currentSet, setCurrentSet] = useState(1);
  const [reps, setReps] = useState('');
  const [weight, setWeight] = useState('');
  const [sessionData, setSessionData] = useState<any[]>([]);
  const [isResting, setIsResting] = useState(false);
  const [restTime, setRestTime] = useState('');
  const [countdown, setCountdown] = useState<number | null>(null);
  const [sound, setSound] = useState<Audio.Sound | null>(null);
  const [hasSkipped, setHasSkipped] = useState(false);

  async function playSound() {
    try {
      const { sound } = await Audio.Sound.createAsync(
        require('../assets/sounds/beep.mp3')
      );
      setSound(sound);
      await sound.playAsync();
    } catch (error) {
      console.error("Błąd odtwarzania dźwięku:", error);
    }
  }

  useEffect(() => {
    return sound ? () => { sound.unloadAsync(); } : undefined;
  }, [sound]);

  useEffect(() => {
    const loadPlan = async () => {
      try {
        const plans = await getUserPlans();
        const selectedPlan = plans.find(plan => plan.id === planId);
        if (selectedPlan) {
          setExercises(selectedPlan.exercises);
        }
      } catch (error) {
        console.error('Błąd ładowania planu:', error);
      }
    };
    loadPlan();
  }, [planId]);

  useFocusEffect(
    useCallback(() => {
      const onBackPress = () => {
        Alert.alert(
          'Ostrzeżenie',
          'Opuszczenie tego ekranu spowoduje utratę treningu. Czy na pewno chcesz zakończyć?',
          [
            { text: 'Nie', style: 'cancel' },
            { text: 'Tak', onPress: () => router.replace('/(tabs)/dashboard') },
          ]
        );
        return true;
      };
      const backHandler = BackHandler.addEventListener('hardwareBackPress', onBackPress);

      return () => backHandler.remove();
    }, [])
  );

  const startRest = () => {
    const restSeconds = parseInt(restTime);
    if (isNaN(restSeconds) || restSeconds <= 0) {
      Alert.alert('Błąd', 'Czas odpoczynku musi być większy od zera');
      return;
    }
    setCountdown(restSeconds);
    setIsResting(true);
  };
  
  const skipRest = () => {
    setIsResting(false);
    setCountdown(null);
    setHasSkipped(true);
  };
  
  useEffect(() => {
    if (typeof countdown === 'number' && countdown > 0) {
      const timer = setTimeout(() => setCountdown(countdown - 1), 1000);
      return () => clearTimeout(timer);
    } else if (countdown === 0) {
      playSound();
      setIsResting(false);
      setCountdown(null);
      
    }
  }, [countdown, hasSkipped]);

  const handleFinishSet = () => {
    const repsClean = reps.trim();
    const weightClean = weight.trim();
    const restTimeClean = restTime.trim();
    
    const isInteger = (val: string) => /^[1-9][0-9]*$/.test(val);
    const isNumber = (val: string) => /^([0-9]+(?:\.[0-9]+)?)$/.test(val);
    
    if (!isInteger(repsClean)) {
      Alert.alert('Błąd', 'Powtórzenia muszą być liczbą całkowitą większą od zera');
      return;
    }
    if (!isNumber(weightClean)) {
      Alert.alert('Błąd', 'Ciężar musi być liczbą większą lub równą 0');
      return;
    }
    if (!isInteger(restTimeClean)) {
      Alert.alert('Błąd', 'Czas odpoczynku musi być liczbą całkowitą większą od zera');
      return;
    }
    
    const repsNum = parseInt(repsClean, 10);
    const weightNum = parseFloat(weightClean);
    const restTimeNum = parseInt(restTimeClean, 10);


    const updatedSession = [...sessionData];
    if (!updatedSession[currentExercise]) {
      updatedSession[currentExercise] = { name: exercises[currentExercise].name, sets: [] };
    }
    updatedSession[currentExercise].sets.push({ reps: repsNum, weight: weightNum });

    setSessionData(updatedSession);
    setReps('');
    setWeight('');

    const isLastSet = currentSet >= exercises[currentExercise].sets;
    const isLastExercise = currentExercise >= exercises.length - 1;

    if (isLastSet && isLastExercise) {
      saveSession(updatedSession);
    } else if (isLastSet) {
      setCurrentExercise(currentExercise + 1);
      startRest();
      setCurrentSet(1);
    } else {
      setCurrentSet(currentSet + 1);
      startRest();
    }
  };

  const saveSession = async (data: any[]) => {
    try {
      await saveWorkoutSession(planId as string, data);
      Alert.alert('Sukces', 'Sesja treningowa zapisana!');
      router.replace('/(tabs)/dashboard');
    } catch (error) {
      Alert.alert('Błąd', 'Nie udało się zapisać sesji treningowej.');
    }
  };

  const handleExit = () => {
    Alert.alert(
      'Ostrzeżenie',
      'Opuszczenie tego ekranu spowoduje utratę treningu. Czy na pewno chcesz zakończyć?',
      [
        { text: 'Nie', style: 'cancel' },
        { text: 'Tak', onPress: () => router.replace('/(tabs)/dashboard') },
      ]
    );
  };

  return (
    <SafeAreaView style={styles.container}>
      {exercises.length > 0 && currentExercise < exercises.length && (
        <>
          {!isResting ? (
            <View style={styles.card}>
              <Text style={styles.title}>{exercises[currentExercise].name}</Text>
              <Text style={styles.subtitle}>
                Seria {currentSet} / {exercises[currentExercise].sets}
              </Text>
              <Text style={styles.repsRange}>
                {exercises[currentExercise].repsRange} powtórzeń
              </Text>
  
              <TextInput
                style={styles.input}
                placeholder="Powtórzenia (np. 10)"
                value={reps}
                onChangeText={setReps}
                keyboardType="numeric"
                placeholderTextColor="#aaa"
              />
              <TextInput
                style={styles.input}
                placeholder="Ciężar (kg) (np. 50)"
                value={weight}
                onChangeText={setWeight}
                keyboardType="numeric"
                placeholderTextColor="#aaa"
              />
              <TextInput
                style={styles.input}
                placeholder="Czas odpoczynku (s)"
                value={restTime}
                onChangeText={setRestTime}
                keyboardType="numeric"
                placeholderTextColor="#aaa"
              />
  
              <TouchableOpacity style={styles.finishButton} onPress={handleFinishSet}>
                <Text style={styles.buttonText}>Zakończ serię</Text>
              </TouchableOpacity>
              <TouchableOpacity style={styles.stopButton} onPress={handleExit}>
                <Text style={styles.buttonText}>Przerwij trening</Text>
              </TouchableOpacity>
            </View>
          ) : (
            <>
              <View style={styles.card}>
                <Text style={styles.restTitle}>Odpoczynek</Text>
                <Text style={styles.restTimer}>
                  {countdown} <Text style={styles.restTimerSmall}>s</Text>
                </Text>
                <Text style={styles.nextUp}>
                  Następnie: {exercises[currentExercise].name} (Seria {currentSet}/{exercises[currentExercise].sets})
                </Text>

                <View style={styles.restButtons}>
                  <TouchableOpacity style={styles.greenButton} onPress={() => setCountdown((prev) => (prev ?? 0) + 30)}>
                    <Text style={styles.buttonText}>+30s</Text>
                  </TouchableOpacity>
                  <TouchableOpacity style={styles.greenButton} onPress={skipRest}>
                    <Text style={styles.buttonText}>Pomiń</Text>
                  </TouchableOpacity>
                </View>

                <TouchableOpacity style={styles.stopButton} onPress={handleExit}>
                  <Text style={styles.buttonText}>Przerwij trening</Text>
                </TouchableOpacity>
              </View>
            </>
          )}
        </>
      )}
    </SafeAreaView>
  );
  
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#121212',
    padding: 24,
    justifyContent: 'center',
    alignItems: 'center',
  },
  card: {
    backgroundColor: '#1e1e1e',
    padding: 20,
    borderRadius: 12,
    width: '100%',
    alignItems: 'center',
  },
  title: {
    fontSize: 24,
    fontWeight: '600',
    color: '#fff',
    marginBottom: 4,
    textAlign: 'center',
  },
  subtitle: {
    fontSize: 16,
    color: '#ccc',
    marginBottom: 4,
    textAlign: 'center',
  },
  repsRange: {
    fontSize: 14,
    color: '#aaa',
    marginBottom: 16,
    textAlign: 'center',
  },
  input: {
    backgroundColor: '#333',
    color: '#fff',
    padding: 12,
    marginVertical: 8,
    borderRadius: 8,
    width: '100%',
    textAlign: 'center',
  },
  finishButton: {
    backgroundColor: '#8B00FF',
    padding: 14,
    marginTop: 16,
    borderRadius: 8,
    width: '100%',
    alignItems: 'center',
  },
  buttonText: {
    color: '#fff',
    fontSize: 18,
    textAlign: 'center',
  },
  exerciseName: {
    fontSize: 20,
    color: '#fff',
    marginBottom: 12,
    textAlign: 'center',
  },
  timerText: {
    color: '#fff',
    fontSize: 22,
    marginVertical: 12,
  },
  buttonGroup: {
    flexDirection: 'column',
    justifyContent: 'center',
  },
  button: {
    backgroundColor: '#10b981',
    padding: 14,
    margin: 8,
    borderRadius: 8,
    width: '100%',
    alignItems: 'center',
    justifyContent: 'center',
  },
  stopButton: {
    backgroundColor: '#d9534f',
    padding: 14,
    margin: 8,
    borderRadius: 8,
    width: '100%',
    alignItems: 'center',
  },
  restTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#fff',
    marginBottom: 12,
    textAlign: 'center',
  },
  restTimer: {
    fontSize: 64,
    fontWeight: 'bold',
    color: '#fff',
    textAlign: 'center',
  },
  restTimerSmall: {
    fontSize: 24,
    fontWeight: 'normal',
    color: '#ccc',
  },
  nextUp: {
    fontSize: 14,
    color: '#10b981',
    marginVertical: 16,
    textAlign: 'center',
  },
  restButtons: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    width: '100%',
  },
  greenButton: {
    backgroundColor: '#10b981',
    padding: 14,
    margin: 8,
    borderRadius: 8,
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  
});