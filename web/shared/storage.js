export function saveItem(key, value) {
    sessionStorage.setItem(key, JSON.stringify(value));
  }
  
  export function getItem(key) {
    const raw = sessionStorage.getItem(key);
    return raw ? JSON.parse(raw) : null;
  }
  
  export function removeItem(key) {
    sessionStorage.removeItem(key);
  }
  