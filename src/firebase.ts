import { initializeApp } from "firebase/app";
import { getAuth } from "firebase/auth";

const firebaseConfig = {
  apiKey: "AIzaSyBvuwAYA1qytNJ_cjGnVyaFZdFD1jVWKKg",
  authDomain: "atlaspos-8e4a9.firebaseapp.com",
  projectId: "atlaspos-8e4a9",
  storageBucket: "atlaspos-8e4a9.firebasestorage.app",
  messagingSenderId: "694585401431",
  appId: "1:694585401431:web:9ae472d2416926b66f8312",
  measurementId: "G-K77WSNTLLY"
};

const app = initializeApp(firebaseConfig);
export const auth = getAuth(app);
