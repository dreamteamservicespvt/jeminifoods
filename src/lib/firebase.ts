import { initializeApp } from 'firebase/app';
import { getFirestore } from 'firebase/firestore';
import { getAuth } from 'firebase/auth';
import { getStorage } from 'firebase/storage';

// For Firebase JS SDK v7.20.0 and later, measurementId is optional
const firebaseConfig = {
  apiKey: "AIzaSyBJL0zn5BrGPv_PKzCbcTRNTODEsE-TFhE",
  authDomain: "jemini-foods.firebaseapp.com",
  projectId: "jemini-foods",
  storageBucket: "jemini-foods.appspot.com",
  messagingSenderId: "624232266019",
  appId: "1:624232266019:web:8d7931c52cf7f2aa55a0c4",
  measurementId: "G-Z1RVG9TN1Y"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);

// Initialize Firebase services
export const auth = getAuth(app);
export const db = getFirestore(app);
export const storage = getStorage(app);

export default app;
