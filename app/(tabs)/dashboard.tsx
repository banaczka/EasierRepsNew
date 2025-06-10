import { countUserPlans, countWeeklyWorkoutDays, getLastWorkoutDate, getTodayMeals, getWorkoutHistory } from '@/lib/firebase';
import { useFocusEffect } from '@react-navigation/native';
import { useRouter } from 'expo-router';
import { getAuth } from 'firebase/auth';
import React, { useState } from 'react';
import { ScrollView, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

export default function DashboardScreen() {
  const router = useRouter();
  const [username, setUsername] = useState<string | null>(null);
  const [weeklyWorkouts, setWeeklyWorkouts] = useState<number | null>(null);
  const [planCount, setPlanCount] = useState<number | null>(null);
  const [lastWorkout, setLastWorkout] = useState<string | null>(null);
  const [todayCalories, setTodayCalories] = useState<number | null>(null);
  const [recentWorkouts, setRecentWorkouts] = useState<any[]>([]);

  useFocusEffect(
    React.useCallback(() => {
      const fetchData = async () => {
        const user = getAuth().currentUser;
        if (!user || !user.email) {
          router.replace('/login');
          return;
        }
  
        const extractedUsername = user.email.split('@')[0];
        setUsername(extractedUsername);
  
        try {
          const [plans, workouts, lastDate, meals, history] = await Promise.all([
            countUserPlans(),
            countWeeklyWorkoutDays(),
            getLastWorkoutDate(),
            getTodayMeals(),
            getWorkoutHistory()
          ]);
  
          setPlanCount(plans);
          setWeeklyWorkouts(workouts);
          setLastWorkout(lastDate ? formatRelativeDate(lastDate) : '-');
          const totalCalories = meals.reduce((sum, meal) => sum + meal.calories, 0);
          setTodayCalories(totalCalories);
          setRecentWorkouts(history.slice(0, 2));
        } catch (error) {
          console.error("Błąd pobierania danych:", error);
        }
      };
  
      fetchData();
    }, [])
  );

  function formatRelativeDate(date: Date): string {
    const today = new Date();
    const diffMs = today.getTime() - date.getTime();
    const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24));
  
    if (diffDays === 0) return 'Dzisiaj';
    if (diffDays === 1) return 'Wczoraj';
    return `${diffDays} dni temu`;
  }

  function formatDate(date: Date): string {
    return date.toLocaleDateString('pl-PL', {
      day: 'numeric',
      month: 'long',
      year: 'numeric',
    });
  }
  

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView contentContainerStyle={styles.scroll}>
      <Text style={styles.greeting}>Witaj{username ? `, ${username}` : ''}!</Text>
      <Text style={styles.subtitle}>Gotowy na trening?</Text>

      <TouchableOpacity style={styles.button} onPress={() => router.push('../select-workout')}>
        <Text style={styles.buttonText}>Rozpocznij trening</Text>
      </TouchableOpacity>
      <View style={styles.statsContainer}>
        <StatCard title="Treningi w tym tygodniu" value={weeklyWorkouts?.toString() ?? "-"} />
        <StatCard title="Kalorie dzisiaj" value={todayCalories?.toString() ?? "-"} />
          <StatCard title="Ostatni trening" value={lastWorkout ?? "-"} />
          <StatCard title="Aktywne plany" value={planCount?.toString() ?? "-"} />
        </View>

        <Text style={styles.sectionTitle}>Ostatnie treningi</Text>
          {recentWorkouts.map((workout) => (
            <WorkoutItem
              key={workout.id}
              name={workout.name}
              date={formatDate(workout.date.toDate())}
              onPress={() => router.push({ pathname: '../history', params: { id: workout.id } })}
            />
          ))}
      </ScrollView>
    </SafeAreaView>
  );
}

const StatCard = ({ title, value }: { title: string; value: string }) => (
  <View style={styles.statCard}>
    <Text style={styles.statTitle}>{title}</Text>
    <Text style={styles.statValue}>{value}</Text>
  </View>
);

const WorkoutItem = ({
  name,
  date,
  onPress,
}: {
  name: string;
  date: string;
  onPress: () => void;
}) => (
  <View style={styles.workoutItem}>
    <View>
      <Text style={styles.workoutName}>{name}</Text>
      <Text style={styles.workoutDate}>{date}</Text>
    </View>
    <TouchableOpacity style={styles.detailButton} onPress={onPress}>
      <Text style={styles.detailButtonText}>Szczegóły</Text>
    </TouchableOpacity>
  </View>
);

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#121212',
  },
  scroll: {
    padding: 24,
    alignItems: 'center',
  },
  greeting: {
    fontSize: 28,
    fontWeight: '700',
    color: '#fff',
    marginBottom: 12,
    textAlign: 'center',
  },
  subtitle: {
    fontSize: 18,
    color: '#ccc',
    marginBottom: 24,
    textAlign: 'center',
  },
  button: {
    backgroundColor: '#10b981',
    paddingVertical: 14,
    paddingHorizontal: 28,
    borderRadius: 12,
    marginBottom: 32,
  },
  buttonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
  },
  statsContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'center',
    gap: 16,
    marginBottom: 32,
  },
  statCard: {
    backgroundColor: '#1e1e1e',
    borderRadius: 12,
    padding: 16,
    width: '45%',
    minWidth: 140,
    margin: 8,
  },
  statTitle: {
    fontSize: 14,
    color: '#aaa',
    marginBottom: 8,
  },
  statValue: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#10b981',
  },
  sectionTitle: {
    fontSize: 20,
    color: '#fff',
    alignSelf: 'flex-start',
    marginBottom: 16,
  },
  workoutItem: {
    backgroundColor: '#1e1e1e',
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
    width: '100%',
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  workoutName: {
    fontSize: 16,
    color: '#fff',
  },
  workoutDate: {
    fontSize: 14,
    color: '#aaa',
  },
  detailButton: {
    backgroundColor: '#10b981',
    borderRadius: 8,
    paddingVertical: 8,
    paddingHorizontal: 16,
  },
  detailButtonText: {
    color: '#fff',
    fontWeight: '600',
  },
});