// src/database/firebaseConfig.js

import { initializeApp } from 'firebase/app';
import { getFirestore } from 'firebase/firestore';
import { initializeAuth, getReactNativePersistence } from 'firebase/auth';
import { getDatabase } from 'firebase/database'; // Corrección de comillas
import ReactNativeAsyncStorage from '@react-native-async-storage/async-storage';
import 'react-native-get-random-values';
import 'react-native-url-polyfill/auto';
import Constants from 'expo-constants';

// Obtener variables de entorno desde extra
const { extra } = Constants.expoConfig;

// Configuración de Firebase
const firebaseConfig = {
  apiKey: extra.FIREBASE_API_KEY,
  authDomain: extra.FIREBASE_AUTH_DOMAIN,
  projectId: extra.FIREBASE_PROJECT_ID,
  storageBucket: extra.FIREBASE_STORAGE_BUCKET,
  messagingSenderId: extra.FIREBASE_MESSAGING_SENDER_ID,
  appId: extra.FIREBASE_APP_ID,
  databaseURL: extra.FIREBASE_DATABASE_URL, // ¡Importante para Realtime!
};

// 1. Inicializar Firebase (PRIMERO)
const app = initializeApp(firebaseConfig);

// 2. Inicializar servicios (DESPUÉS de tener 'app')
const auth = initializeAuth(app, {
  persistence: getReactNativePersistence(ReactNativeAsyncStorage),
});

const db = getFirestore(app);
const realtimeDB = getDatabase(app); // Ahora sí funciona porque 'app' ya existe

// 3. UNA SOLA exportación con todo
export { app, auth, db, realtimeDB };