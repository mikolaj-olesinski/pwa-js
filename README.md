# Koty PWA

Progressive Web Application o kotach.

## Setup

1. Sklonuj repozytorium
2. Utwórz plik `js/firebase-config.js` z następującą zawartością:
```javascript
const firebaseConfig = {
  apiKey: "YOUR_API_KEY",
  authDomain: "YOUR_AUTH_DOMAIN",
  projectId: "YOUR_PROJECT_ID",
  storageBucket: "YOUR_STORAGE_BUCKET",
  messagingSenderId: "YOUR_MESSAGING_SENDER_ID",
  appId: "YOUR_APP_ID",
  measurementId: "YOUR_MEASUREMENT_ID"
};
```

## Hosting na GitHub Pages

1. Przejdź do ustawień repozytorium na GitHub
2. W sekcji "Pages" wybierz branch `main` jako źródło
3. Wybierz folder `/ (root)` jako katalog źródłowy
4. Zapisz zmiany

Strona będzie dostępna pod adresem: `https://[twoja-nazwa-uzytkownika].github.io/[nazwa-repozytorium]` 