import ReactNativeAsyncStorage from "@react-native-async-storage/async-storage";
import { initializeApp } from "firebase/app";
import { getAuth, getReactNativePersistence, initializeAuth } from "firebase/auth";
import { addDoc, collection, deleteDoc, doc, getDoc, getDocs, getFirestore, orderBy, query, Timestamp, where, } from "firebase/firestore";
import { getFunctions } from 'firebase/functions';

const firebaseConfig = {
  apiKey: "AIzaSyCkb0g8fLi9uyZjTu9ArbkVHK8b6GCp7Ko",
  authDomain: "easierrepsnew.firebaseapp.com",
  projectId: "easierrepsnew",
  storageBucket: "easierrepsnew.firebasestorage.app",
  messagingSenderId: "962887154104",
  appId: "1:962887154104:web:8b2c33d753f46207edb74d"
};

export const app = initializeApp(firebaseConfig);
export const auth = initializeAuth(app, {
  persistence: getReactNativePersistence(ReactNativeAsyncStorage)
});
export const db = getFirestore(app);
export const functions = getFunctions(app);

export async function savePlanToFirestore(name: string, days: string[], exercises: any[]) {
  try {
    const user = getAuth().currentUser;
    if (!user) {
      throw new Error("Użytkownik niezalogowany")
    }

    if (typeof name !== "string" || name.trim().length < 2) {
      throw new Error("Nazwa planu jest nieprawidłowa");
    }

    if (!Array.isArray(days) || days.length === 0 || !days.every(d => typeof d === "string")) {
      throw new Error("Lista dni jest nieprawidłowa");
    }

    if (!Array.isArray(exercises) || exercises.length === 0) {
      throw new Error("Brak ćwiczeń w planie");
    }

    for (const ex of exercises) {
      if (typeof ex.name !== "string" || ex.name.trim().length === 0) {
        throw new Error("Ćwiczenie bez nazwy");
      }
      if (typeof ex.sets !== "number" || ex.sets <= 0 || !Number.isInteger(ex.sets)) {
        throw new Error("Ćwiczenie musi mieć dodatnią liczbę serii");
      }
      if (typeof ex.repsRange !== "string" || !ex.repsRange.match(/^\d+\s*[-]\s*\d+$/)) {
        throw new Error("Zakres powtórzeń jest nieprawidłowy");
      }
      const [min, max] = ex.repsRange.split('-').map((s: string) => parseInt(s.trim(), 10));
      if (isNaN(min) || isNaN(max) || !Number.isInteger(max) || !Number.isInteger(min)) {
        throw new Error("Zakres powtórzeń zawiera nieprawidłowe liczby");
      }
      if (min > max) {
        throw new Error("Zakres powtórzeń nie może być malejący (np. 8-12)");
      }
    }

    const q = query(
      collection(db, "plans"),
      where("userId", "==", user.uid),
      where("name", "==", name)
    );
    const querySnapshot = await getDocs(q);
    if (!querySnapshot.empty) {
      console.warn("Plan o takiej nazwie już istnieje");
      return null;
    }
    const plan = {
      userId: user.uid,
      name,
      days,
      createdAt: Timestamp.now(),
      exercises
    };
    const docRef = await addDoc(collection(db, "plans"), plan);
    return docRef.id;
  } catch (error) {
    console.error("Błąd podczas zapisu planu: ", error);
    throw error;
  }
}

export async function getUserPlans() {
  const user = getAuth().currentUser;
  if (!user) throw new Error("Brak zalogowanego użytkownika");

  const plansSnapshot = await getDocs(collection(db, "plans"));
  const plans = plansSnapshot.docs
    .map(doc => {
      const data = doc.data() as {userId: string, name: string, days: string[], exercises: any[], createdAt: any};
      return { id: doc.id, ...data};
    })
    .filter(plan => plan.userId === user.uid);

  return plans;
}

export async function getUserPlansWithStats() {
  const user = getAuth().currentUser;
  if (!user) throw new Error("Brak zalogowanego użytkownika");

  const plansSnapshot = await getDocs(
    query(collection(db, "plans"), where("userId", "==", user.uid))
  );

  const plans = plansSnapshot.docs.map(doc => {
    const data = doc.data() as {
      name: string;
      days: string[];
      exercises: { name: string; sets: number; repsRange: string }[];
    };

    const totalSets = data.exercises.reduce((sum, ex) => sum + ex.sets, 0);

    return {
      id: doc.id,
      name: data.name,
      days: data.days,
      exercises: data.exercises,
      totalSets,
      totalExercises: data.exercises.length,
    };
  });

  return plans;
}


export async function deletePlan(planId: string) {
  try {
    await deleteDoc(doc(db, "plans", planId));
  } catch (error) {
    console.error("Błąd usuwania planu:", error);
    throw error;
  }
}

export async function countWeeklyWorkoutDays() {
  const user = getAuth().currentUser;
  if (!user) throw new Error("Brak zalogowanego użytkownika");

  const q = query(
    collection(db, "plans"),
    where("userId", "==", user.uid)
  );
  const querySnapshot = await getDocs(q);

  let dayCount = 0;
  querySnapshot.forEach(doc => {
    const data = doc.data();
    if (Array.isArray(data.days)) {
      dayCount += data.days.length;
    }
  });

  return dayCount;
}

export async function countUserPlans() {
  const user = getAuth().currentUser;
  if (!user) throw new Error("Brak zalogowanego użytkownika");

  const q = query(
    collection(db, "plans"),
    where("userId", "==", user.uid)
  );
  const querySnapshot = await getDocs(q);

  return querySnapshot.size;
}

export async function saveWorkoutSession(planId: string, exercises: any[]) {
  try {
    const user = getAuth().currentUser;
    if (!user) throw new Error("Użytkownik niezalogowany!");

    if (typeof planId !== "string" || planId.trim().length === 0) {
      throw new Error("Nieprawidłowy identyfikator planu");
    }

    if (!Array.isArray(exercises) || exercises.length === 0) {
      throw new Error("Brak ćwiczeń do zapisania");
    }

    for (const ex of exercises) {
      if (typeof ex.name !== "string" || ex.name.trim().length === 0) {
        throw new Error("Ćwiczenie bez nazwy");
      }

      if (!Array.isArray(ex.sets) || ex.sets.length === 0) {
        throw new Error(`Ćwiczenie "${ex.name}" nie zawiera żadnych serii`);
      }

      for (const set of ex.sets) {
        if (typeof set.reps !== "number" || set.reps <= 0 || !Number.isInteger(set.reps)) {
          throw new Error(`Nieprawidłowa liczba powtórzeń w ćwiczeniu "${ex.name}"`);
        }
        if (typeof set.weight !== "number" || set.weight < 0 || !Number.isInteger(set.weight)) {
          throw new Error(`Nieprawidłowa waga w ćwiczeniu "${ex.name}"`);
        }
      }
    }

    const planRef = doc(db, "plans", planId);
    const planSnap = await getDoc(planRef);
    const planName = planSnap.exists() ? planSnap.data().name : "Nieznany plan";

    const workoutSession = {
      userId: user.uid,
      planId,
      name: planName,
      date: Timestamp.now(),
      exercises,
    };

    const docRef = await addDoc(collection(db, "workoutSessions"), workoutSession);
    return docRef.id;
  } catch (error) {
    console.error("Błąd zapisu sesji treningowej: ", error);
    throw error;
  }
}

export async function deleteWorkoutSession(sessionId: string) {
  try {
    await deleteDoc(doc(db, "workoutSessions", sessionId));
  } catch (error) {
    console.error("Błąd usuwania sesji treningowej:", error);
    throw error;
  }
}

export async function getWorkoutHistory() {
  try {
    const user = getAuth().currentUser;
    if (!user) throw new Error("Brak zalogowanego użytkownika");

    const q = query(
      collection(db, "workoutSessions"),
      where("userId", "==", user.uid),
      orderBy("date", "desc")
    );
    const querySnapshot = await getDocs(q);
    const history = querySnapshot.docs.map((doc) => ({ id: doc.id, ...doc.data() }));
    return history;
  } catch (error) {
    console.error("Błąd pobierania historii treningów:", error);
    throw error;
  }
}

export async function getLastWorkoutDate() {
  const user = getAuth().currentUser;
  if (!user) throw new Error("Brak zalogowanego użytkownika");

  const q = query(
    collection(db, "workoutSessions"),
    where("userId", "==", user.uid),
    orderBy("date", "desc"),
  );
  const snapshot = await getDocs(q);
  if (snapshot.empty) return null;

  const latest = snapshot.docs[0].data();
  return latest.date.toDate();
}

export async function saveMealToFirestore(name: string, calories: number) {
  try {
    const user = getAuth().currentUser;
    if (!user) throw new Error("Użytkownik niezalogowany!");

    if (typeof name !== "string" || name.trim().length < 1) {
      throw new Error("Nazwa posiłku jest nieprawidłowa");
    }

    if (typeof calories !== "number" || !Number.isInteger(calories) || calories <= 0) {
      throw new Error("Kalorie muszą być liczbą całkowitą większą od zera");
    }

    const meal = {
      userId: user.uid,
      name,
      calories,
      date: Timestamp.now(),
    };
    await addDoc(collection(db, "meals"), meal);
  } catch (error) {
    console.error("Błąd zapisu posiłku:", error);
    throw error;
  }
}

export async function getTodayMeals() {
  try {
    const user = getAuth().currentUser;
    if (!user) throw new Error("Brak zalogowanego użytkownika");

    const startOfDay = new Date();
    startOfDay.setHours(0, 0, 0, 0);

    const q = query(
      collection(db, "meals"),
      where("userId", "==", user.uid),
      where("date", ">=", Timestamp.fromDate(startOfDay))
    );

    const querySnapshot = await getDocs(q);
    const meals = querySnapshot.docs.map((doc) => {
      const data = doc.data() as { name: string; calories: number; date: any };
      return { id: doc.id, ...data };
    });
    return meals;
  } catch (error) {
    console.error("Błąd pobierania posiłków:", error);
    throw error;
  }
}

export async function deleteMeal(mealId: string) {
  try {
    await deleteDoc(doc(db, "meals", mealId));
    console.log("Posiłek został usunięty.");
  } catch (error) {
    console.error("Błąd usuwania posiłku:", error);
    throw error;
  }
}

export async function saveNotification(title: string, body: string, hour: number, minute:number) {
  try {
    const user = getAuth().currentUser;
    if (!user) throw new Error("Użytkownik niezalogowany!");

    if (typeof title !== "string" || title.trim().length === 0) {
      throw new Error("Tytuł powiadomienia jest nieprawidłowy");
    }

    if (typeof body !== "string" || body.trim().length === 0) {
      throw new Error("Treść powiadomienia jest nieprawidłowa");
    }

    if (!Number.isInteger(hour) || hour < 0 || hour > 23) {
      throw new Error("Godzina musi być liczbą całkowitą od 0 do 23");
    }

    if (!Number.isInteger(minute) || minute < 0 || minute > 59) {
      throw new Error("Minuta musi być liczbą całkowitą od 0 do 59");
    }

    const notification = {
      userId: user.uid,
      title: title.trim(),
      body: body.trim(),
      hour,
      minute,
    };
    await addDoc(collection(db, "notifications"), notification);
    console.log("Powiadomienie zapisane:", notification);
  } catch (error) {
    console.error("Błąd zapisu powiadomienia:", error);
    throw error;
  }
}

export async function getUserNotification(userId: string) {
  try {
    const user = getAuth().currentUser;
    if (!user) throw new Error("Brak zalogowanego użytkownika");

    const q = query(
      collection(db, "notifications"),
      where("userId", "==", user.uid)
    );
    const querySnapshot = await getDocs(q);
    const notifications = querySnapshot.docs.map((doc) => {
      const data = doc.data() as { title: string; body: string; hour: number; minute: number };
      return { id: doc.id, ...data };
    });

    return notifications.length > 0 ? notifications[0] : null;
  } catch (error) {
    console.error("Błąd pobierania powiadomienia:", error);
    return null;
  }
}

export async function deleteUserNotification(userId: string) {
  try {
    const q = query(collection(db, "notifications"), where("userId", "==", userId));
    const querySnapshot = await getDocs(q);
    for (const doc of querySnapshot.docs) {
      await deleteDoc(doc.ref);
      console.log("Powiadomienie usunięte:", doc.id);
    }
  } catch (error) {
    console.error("Błąd usuwania powiadomienia:", error);
  }
}