// Importowanie konfiguracji Firebase
import firebaseConfig from '../firebase-config.js';
import { initializeApp } from 'https://www.gstatic.com/firebasejs/11.6.1/firebase-app.js';
import { getMessaging, getToken, onMessage } from 'https://www.gstatic.com/firebasejs/11.6.1/firebase-messaging.js';
import { getAnalytics } from 'https://www.gstatic.com/firebasejs/11.6.1/firebase-analytics.js';

window.onload = () => {
  'use strict';
  
  // Inicjalizacja Firebase
  const app = initializeApp(firebaseConfig);
  const analytics = getAnalytics(app);
  const messaging = getMessaging(app);
  
  // Rejestracja Service Workera
  if ('serviceWorker' in navigator) {
    navigator.serviceWorker.register('./sw.js')
      .then(registration => {
        console.log('Service Worker zarejestrowany pomyślnie.', registration.scope);
        initializeFirebaseMessaging(registration);
      })
      .catch((error) => console.error('Błąd rejestracji Service Workera:', error));
  }
  
  // Obsługa powiadomień
  const notificationButton = document.getElementById('notifications-btn');
  
  if (notificationButton) {
    notificationButton.addEventListener('click', () => {
      requestNotificationPermission();
    });
  }
  
  // Funkcja do inicjalizacji Firebase Messaging
  function initializeFirebaseMessaging(registration) {
    // Nasłuchiwanie wiadomości gdy aplikacja jest otwarta
    onMessage(messaging, (payload) => {
      console.log('Otrzymano wiadomość gdy aplikacja jest aktywna:', payload);
      showNotification(payload.notification.title, payload.notification.body);
    });
  }
  
  // Funkcja do żądania uprawnień do powiadomień
  function requestNotificationPermission() {
    if ('Notification' in window) {
      Notification.requestPermission()
        .then(permission => {
          if (permission === 'granted') {
            console.log('Uprawnienia do powiadomień przyznane');
            subscribeToPushNotifications();
          } else {
            console.log('Brak uprawnień do powiadomień');
          }
        });
    }
  }
  
  // Funkcja do subskrypcji powiadomień push
  function subscribeToPushNotifications() {
    if ('serviceWorker' in navigator && 'PushManager' in window) {
      navigator.serviceWorker.ready
        .then(registration => {
          // Pobieranie tokenu FCM
          getToken(messaging, {
            vapidKey: 'TWÓJ_KLUCZ_VAPID_PUBLIC', // Tutaj należy wstawić klucz VAPID
            serviceWorkerRegistration: registration
          })
          .then(token => {
            if (token) {
              console.log('Token FCM:', token);
              saveTokenToServer(token);
              showTestNotification(registration);
            } else {
              console.log('Nie można uzyskać tokenu. Poproś o zgodę na powiadomienia.');
              requestNotificationPermission();
            }
          })
          .catch(error => {
            console.error('Błąd podczas pobierania tokenu:', error);
          });
        })
        .catch(error => {
          console.error('Błąd podczas subskrypcji powiadomień:', error);
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
    registration.showNotification('Koty internetowe', {
      body: 'Dziękujemy za włączenie powiadomień!',
      icon: 'images/pwa-icon-192.png',
      badge: 'images/pwa-icon-128.png',
      vibrate: [100, 50, 100],
      data: {
        url: window.location.href
      }
    });
  }
  
  // Funkcja do wyświetlania powiadomień podczas aktywnej sesji
  function showNotification(title, body) {
    const options = {
      body: body,
      icon: 'images/pwa-icon-192.png',
      badge: 'images/pwa-icon-128.png',
      vibrate: [100, 50, 100],
      data: {
        url: window.location.href
      }
    };
    
    navigator.serviceWorker.ready.then(registration => {
      registration.showNotification(title, options);
    });
  }
};