import { initializeApp } from "firebase/app";
import { getFirestore } from "firebase/firestore";

const firebaseConfig = {
  apiKey: import.meta.env.VITE_FIREBASE_API_KEY || "AIzaSyCyT-gYSDU2Yfe9xkTJt2bMfUfpvZRVXy0",
  authDomain: import.meta.env.VITE_FIREBASE_AUTH_DOMAIN || "rgls--data.firebaseapp.com",
  projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID || "rgls--data",
  storageBucket: import.meta.env.VITE_FIREBASE_STORAGE_BUCKET || "rgls--data.firebasestorage.app",
  messagingSenderId: import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID || "782805080690",
  appId: import.meta.env.VITE_FIREBASE_APP_ID || "1:782805080690:web:303e483dfe38ac5cf700eb"
};

const app = initializeApp(firebaseConfig);
export const db = getFirestore(app);
export default app;
