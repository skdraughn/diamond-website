"use client";

import { getApp, getApps, initializeApp } from "firebase/app";

const firebaseConfig = {
  apiKey:
    process.env.NEXT_PUBLIC_FIREBASE_API_KEY ||
    "AIzaSyA0DogBKcfj2PgR6cDOExB7QSD2uAcIcv8",
  authDomain:
    process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN ||
    "diamond-trivia-1.firebaseapp.com",
  projectId:
    process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID ||
    "diamond-trivia-1",
  storageBucket:
    process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET ||
    "diamond-trivia-1.firebasestorage.app",
  messagingSenderId:
    process.env.NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID ||
    "922430195101",
  appId:
    process.env.NEXT_PUBLIC_FIREBASE_APP_ID ||
    "1:922430195101:android:299ac738019a845a529b74",
  measurementId: process.env.NEXT_PUBLIC_FIREBASE_MEASUREMENT_ID,
};

export function hasFirebaseConfig() {
  return Boolean(
    firebaseConfig.apiKey &&
      firebaseConfig.projectId &&
      firebaseConfig.appId
  );
}

export function getFirebaseApp() {
  if (!hasFirebaseConfig()) return null;
  return getApps().length ? getApp() : initializeApp(firebaseConfig);
}
