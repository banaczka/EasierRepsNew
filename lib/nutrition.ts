import axios from 'axios';
import { doc, getDoc, getFirestore } from 'firebase/firestore';

const APP_ID = '27eb74ef';
const BASE_URL = 'https://trackapi.nutritionix.com/v2';

async function getApiKey(): Promise<string | null> {
  try {
    const db = getFirestore();
    const docRef = doc(db, 'config', 'apiKeys');
    const docSnap = await getDoc(docRef);

    if (docSnap.exists()) {
      const apiKey = docSnap.data().nutritionix;
      console.log('Pobrano klucz API:', apiKey);
      return apiKey;
    } else {
      console.warn('Nie znaleziono klucza API w bazie');
      return null;
    }
  } catch (error: any) {
    console.error('Błąd pobierania klucza API:', error.message);
    return null;
  }
}

export async function fetchCalories(item: string, quantity: number): Promise<number | null> {
  try {
    const apiKey = await getApiKey();
    if (!apiKey) {
      throw new Error('Nie udało się pobrać klucza API');
    }

    const response = await axios.post(
      `${BASE_URL}/natural/nutrients`,
      {
        query: `${quantity}g ${item}`,
      },
      {
        headers: {
          'x-app-id': APP_ID,
          'x-app-key': apiKey,
          'Content-Type': 'application/json'
        }
      }
    );

    if (response.data.foods && response.data.foods.length > 0) {
      const calories = response.data.foods[0].nf_calories;
      console.log(`Produkt: ${item}, Kalorie: ${calories}`);
      return calories;
    } else {
      console.warn('Nie znaleziono produktu w bazie Nutritionix');
      return null;
    }
  } catch (error: any) {
    if (error.response && error.response.status === 404) {
      console.warn('Nie znaleziono produktu w bazie Nutritionix');
      return null;
    }
    console.error('❌ Błąd pobierania kalorii:', error.message);
    throw new Error('Błąd pobierania kalorii');
  }
}
