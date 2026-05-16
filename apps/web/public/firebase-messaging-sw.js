importScripts('https://www.gstatic.com/firebasejs/10.7.1/firebase-app-compat.js');
importScripts('https://www.gstatic.com/firebasejs/10.7.1/firebase-messaging-compat.js');

firebase.initializeApp({
  apiKey: "AIzaSyBNGnYqxs4nVWysKrVRw5Ag98QNVtGXN-k",
  authDomain: "nfa-alerts-v2.firebaseapp.com",
  projectId: "nfa-alerts-v2",
  storageBucket: "nfa-alerts-v2.firebasestorage.app",
  messagingSenderId: "466111323548",
  appId: "1:466111323548:web:d151736b0897808d8ffc59"
});

const messaging = firebase.messaging();

messaging.onBackgroundMessage((payload) => {
  console.log('Received background message:', payload);

  const notificationTitle = payload.notification?.title || 'New Notification';
  const notificationOptions = {
    body: payload.notification?.body || '',
    icon: '/icon-192.png',
    badge: '/icon-192.png',
    data: payload.data,
  };

  self.registration.showNotification(notificationTitle, notificationOptions);
});
