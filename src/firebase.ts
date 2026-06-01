import { initializeApp } from "firebase/app";
import { getAuth } from "firebase/auth";
import { getFirestore } from "firebase/firestore";
import { getStorage } from "firebase/storage";
import { getAnalytics } from "firebase/analytics";

const firebaseConfig = {
  apiKey: "AIzaSyD4HZwXJ9g92hLcblrzmMRfDumdnVfEZog",
  authDomain: "dugun-e8203.firebaseapp.com",
  projectId: "dugun-e8203",
  storageBucket: "dugun-e8203.firebasestorage.app",
  messagingSenderId: "1058820932374",
  appId: "1:1058820932374:web:5e6ec6a44c6734393cc637",
  measurementId: "G-Y16X1HZX4Q"
};

const app = initializeApp(firebaseConfig);
export const auth = getAuth(app);
export const db = getFirestore(app);
export const storage = getStorage(app);
export const analytics = typeof window !== 'undefined' ? getAnalytics(app) : null;
