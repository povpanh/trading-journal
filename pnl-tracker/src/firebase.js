import { initializeApp } from "firebase/app";
import { getFirestore } from "firebase/firestore";

const firebaseConfig = {
  apiKey: "AIzaSyAMrCZZIJxh2pHiDTu2lqhnb08KbLYOvs8",
  authDomain: "trading-journal-web-60b34.firebaseapp.com",
  projectId: "trading-journal-web-60b34",
  storageBucket: "trading-journal-web-60b34.firebasestorage.app",
  messagingSenderId: "276181123529",
  appId: "1:276181123529:web:bf3a0af38c832b42562818",
  measurementId: "G-CDCFSQ6SZ5"
};

const app = initializeApp(firebaseConfig);
export const db = getFirestore(app);
