// main.js
import firebaseConfig from './firebase-config.js';
import { initializeApp } from 'https://www.gstatic.com/firebasejs/11.6.1/firebase-app.js';
import { getMessaging, getToken, onMessage } from 'https://www.gstatic.com/firebasejs/11.6.1/firebase-messaging.js';
import { getAnalytics } from 'https://www.gstatic.com/firebasejs/11.6.1/firebase-analytics.js';

// Klucz VAPID - należy go wygenerować w konsoli Firebase
const vapidKey = 'BChQn_l0Pek-NrtgybswkUDZcUDT4ZQtE5blRA_4Ypium4weT-MZ8nfGjUpQ9nvuRlxgh7wnB_L8FlJjozY-gf0';

document.addEventListener('DOMContentLoaded', () => {
  'use strict';

  console.log('DOM załadowany - inicjalizacja aplikacji...');

  // Inicjalizacja Firebase
  try {
    const app = initializeApp(firebaseConfig);
    const analytics = getAnalytics(app);
    const messaging = getMessaging(app);

    console.log('Firebase załadowany pomyślnie');

    // Rejestracja Service Workera
    if ('serviceWorker' in navigator) {
      navigator.serviceWorker.register('./sw.js')
        .then(registration => {
          console.log('Service Worker zarejestrowany pomyślnie.', registration.scope);
          initializeFirebaseMessaging(registration, messaging);
        })
        .catch((error) => {
          console.error('Błąd rejestracji Service Workera:', error);
        });
    } else {
      console.error('Ta przeglądarka nie obsługuje Service Workerów');
    }

    // Obsługa powiadomień
    const notificationButton = document.getElementById('notifications-btn');

    if (notificationButton) {
      console.log('Znaleziono przycisk powiadomień, dodawanie nasłuchiwacza zdarzeń...');
      notificationButton.addEventListener('click', () => {
        console.log('Przycisk powiadomień kliknięty');
        requestNotificationPermission(messaging);
      });
    } else {
      console.error('Nie znaleziono przycisku powiadomień');
    }
  } catch (error) {
    console.error('Błąd podczas inicjalizacji Firebase:', error);
  }

  // Funkcja do inicjalizacji Firebase Messaging
  function initializeFirebaseMessaging(registration, messaging) {
    // Nasłuchiwanie wiadomości gdy aplikacja jest otwarta
    onMessage(messaging, (payload) => {
      console.log('Otrzymano wiadomość gdy aplikacja jest aktywna:', payload);
      showNotification(payload.notification.title, payload.notification.body);
    });
  }

  // Funkcja do żądania uprawnień do powiadomień
  function requestNotificationPermission(messaging) {
    console.log('Żądanie uprawnień do powiadomień...');
    if ('Notification' in window) {
      Notification.requestPermission()
        .then(permission => {
          console.log('Status uprawnień:', permission);
          if (permission === 'granted') {
            console.log('Uprawnienia do powiadomień przyznane');
            subscribeToPushNotifications(messaging);
          } else {
            console.log('Brak uprawnień do powiadomień');
            alert('Aby otrzymywać powiadomienia, musisz wyrazić na to zgodę.');
          }
        })
        .catch(error => {
          console.error('Błąd podczas żądania uprawnień:', error);
          alert('Wystąpił błąd podczas próby włączenia powiadomień.');
        });
    } else {
      alert('Twoja przeglądarka nie wspiera powiadomień.');
    }
  }

  // Funkcja do subskrypcji powiadomień push
  function subscribeToPushNotifications(messaging) {
    console.log('Próba subskrypcji powiadomień push...');
    if ('serviceWorker' in navigator && 'PushManager' in window) {
      navigator.serviceWorker.ready
        .then(registration => {
          console.log('Service Worker gotowy, pobieranie tokenu FCM...');
          // Pobieranie tokenu FCM
          getToken(messaging, {
            vapidKey: vapidKey,
            serviceWorkerRegistration: registration
          })
            .then(token => {
              if (token) {
                console.log('Token FCM:', token);
                saveTokenToServer(token);
                showTestNotification(registration);
              } else {
                console.log('Nie można uzyskać tokenu. Poproś o zgodę na powiadomienia.');
                requestNotificationPermission(messaging);
              }
            })
            .catch(error => {
              console.error('Błąd podczas pobierania tokenu:', error);
              console.error('Szczegóły błędu:', error.message, error.code);
              alert('Wystąpił błąd podczas konfiguracji powiadomień: ' + error.message);
            });
        })
        .catch(error => {
          console.error('Błąd podczas subskrypcji powiadomień:', error);
          alert('Wystąpił błąd podczas konfiguracji powiadomień.');
        });
    }
  }

  // Funkcja do wysyłania tokenu do serwera
  function saveTokenToServer(token) {
    // Tutaj normalnie wysłałbyś token do swojego serwera
    // aby mógł później wysyłać powiadomienia push
    console.log('Token zapisany:', token);
    // Na potrzeby testów możesz użyć localStorage
    localStorage.setItem('fcmToken', token);
  }

  // Funkcja do wyświetlania testowej notyfikacji
  function showTestNotification(registration) {
    console.log('Wyświetlanie testowej notyfikacji...');
    registration.showNotification('Koty internetowe', {
      body: 'Dziękujemy za włączenie powiadomień!',
      icon: '/images/pwa-icon-192.png',
      badge: '/images/pwa-icon-128.png',
      vibrate: [100, 50, 100],
      data: {
        url: window.location.href
      }
    });
  }

  // Funkcja do wyświetlania powiadomień podczas aktywnej sesji
  function showNotification(title, body) {
    console.log('Wyświetlanie powiadomienia w aktywnej sesji:', title, body);
    const options = {
      body: body,
      icon: '/images/pwa-icon-192.png',
      badge: '/images/pwa-icon-128.png',
      vibrate: [100, 50, 100],
      data: {
        url: window.location.href
      }
    };

    navigator.serviceWorker.ready.then(registration => {
      registration.showNotification(title, options);
    });
  }
});