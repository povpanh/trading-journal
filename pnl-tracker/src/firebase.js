import { initializeApp } from "firebase/app";
import { getFirestore, enableIndexedDbPersistence } from "firebase/firestore";

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

// Enable offline persistence for faster loading and cross-tab/device cache
if (typeof window !== "undefined") {
  enableIndexedDbPersistence(db).catch((err) => {
    if (err.code === "failed-precondition") {
      // Multiple tabs open, persistence can only be enabled in one tab at a time.
      console.warn("Firestore persistence failed: Multiple tabs open simultaneously.");
    } else if (err.code === "unimplemented") {
      // The current browser does not support all of the features required to enable persistence
      console.warn("Firestore persistence is not supported by the current browser environment.");
    } else {
      console.warn("Firestore persistence error:", err);
    }
  });
}
