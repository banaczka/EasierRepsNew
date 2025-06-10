import { useRouter } from 'expo-router';
import React, { useEffect, useState } from 'react';
import { Alert, FlatList, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { deleteWorkoutSession, getWorkoutHistory } from '../lib/firebase';

export default function HistoryScreen() {
  const router = useRouter();
  const [workoutHistory, setWorkoutHistory] = useState<any[]>([]);

  useEffect(() => {
    const fetchHistory = async () => {
      try {
        const history = await getWorkoutHistory();
        setWorkoutHistory(history);
      } catch (error) {
        console.error('Błąd ładowania historii treningów:', error);
      }
    };
    fetchHistory();
  }, []);

  const formatDate = (date: any): string => {
    if (date && typeof date === 'object' && 'seconds' in date) {
      const jsDate = new Date(date.seconds * 1000);
      return jsDate.toLocaleDateString('pl-PL', {
        day: 'numeric',
        month: 'long',
        year: 'numeric',
      });
    }
    return 'Brak daty';
  };
  

  const handleDelete = async (sessionId: string) => {
    Alert.alert(
      'Usuń trening',
      'Czy na pewno chcesz usunąć ten trening?',
      [
        { text: 'Anuluj', style: 'cancel' },
        {
          text: 'Usuń',
          style: 'destructive',
          onPress: async () => {
            try {
              await deleteWorkoutSession(sessionId);
              setWorkoutHistory((prev) => prev.filter((item) => item.id !== sessionId));
            } catch (error) {
              console.error('Błąd usuwania treningu:', error);
              Alert.alert('Błąd', 'Nie udało się usunąć treningu.')
            }
          }
        }
      ]
    )
  }

  const formatSet = (set: any) => {
    if (set.weight > 0) {
      return `${set.reps} powtórzeń, obciążenie ${set.weight} kg`;
    }
    return `${set.reps} powtórzeń`;
  };

  return (
    <SafeAreaView style={styles.container}>
      <Text style={styles.title}>Twoje treningi</Text>
      {workoutHistory.length === 0 ? (
        <Text style={styles.noHistory}>Brak zapisanych treningów</Text>
      ) : (
        <FlatList
          data={workoutHistory}
          keyExtractor={(item) => item.id}
          renderItem={({ item }) => (
            <View style={styles.historyItem}>
              <Text style={styles.historyTitle}>{item.name || 'Nieznany trening'}</Text>
              <Text style={styles.historyDate}>{formatDate(item.date)}</Text>

              {item.exercises.map((exercise: any, index: number) => (
                <View key={index} style={styles.exerciseContainer}>
                  <Text style={styles.exerciseName}>{exercise.name}</Text>
                  {exercise.sets.map((set: any, setIndex: number) => (
                    <Text key={setIndex} style={styles.exerciseDetails}>
                      Seria {setIndex + 1}: {formatSet(set)}
                    </Text>
                  ))}
                </View>
              ))}

              <TouchableOpacity
                style={styles.deleteButton}
                onPress={() => handleDelete(item.id)}
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
    padding: 16 
  },
  title: { 
    fontSize: 24, 
    color: '#fff', 
    marginBottom: 16 
  },
  noHistory: {
    color: '#bbb', 
    fontSize: 18, 
    textAlign: 'center', 
    marginTop: 20,
    fontStyle: 'italic'
  },
  historyItem: { 
    backgroundColor: '#1e1e1e', 
    padding: 16, 
    marginVertical: 8, 
    borderRadius: 8 
  },
  historyTitle: { 
    color: '#fff', 
    fontSize: 20, 
    marginBottom: 4 
  },
  historyDate: { 
    color: '#888', 
    fontSize: 16 
  },
  exerciseContainer: { 
    marginTop: 8 
  },
  exerciseName: { 
    color: '#10b981', 
    fontSize: 18, 
    marginBottom: 4 
  },
  exerciseDetails: { 
    color: '#ccc', 
    fontSize: 16, 
    marginLeft: 16 
  },
  deleteButton: {
    backgroundColor: '#e74c3c',
    paddingVertical: 8,
    paddingHorizontal: 24,
    borderRadius: 6,
    alignSelf: 'center',
    marginTop: 16,
  },
  deleteButtonText: { 
    color: '#fff', 
    fontSize: 14 
  },
});