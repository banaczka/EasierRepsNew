import { doc, getDoc, getFirestore } from "https://www.gstatic.com/firebasejs/10.12.2/firebase-firestore.js";

const BASE_URL = "https://trackapi.nutritionix.com/v2";

async function getApiKey() {
  try {
    const db = getFirestore();
    const docRef = doc(db, "config", "apiKeys");
    const docSnap = await getDoc(docRef);

    if (docSnap.exists()) {
      const apiKey = docSnap.data().nutritionix;
      return apiKey;
    } else {
      console.warn("Nie znaleziono klucza API w bazie");
      return null;
    }
  } catch (error) {
    console.error("Błąd pobierania klucza API:", error.message);
    return null;
  }
}

export async function fetchCalories(item, quantity) {
  try {
    const apiKey = await getApiKey();
    if (!apiKey) throw new Error("Brak klucza API");

    const response = await fetch(`${BASE_URL}/natural/nutrients`, {
      method: "POST",
      headers: {
        "x-app-id": "27eb74ef",
        "x-app-key": apiKey,
        "Content-Type": "application/json"
      },
      body: JSON.stringify({ query: `${quantity}g ${item}` })
    });

    const data = await response.json();
    return data.foods?.[0]?.nf_calories || null;
  } catch (err) {
    console.error("Błąd pobierania kalorii:", err);
    return null;
  }
}
