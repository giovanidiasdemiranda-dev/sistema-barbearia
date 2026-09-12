import { initializeApp } from "firebase/app";
import { getFirestore } from "firebase/firestore";

const firebaseConfig = {
  apiKey: "AIzaSyCyvAF2NChUULWzz8ZARTKeJFPj3MmLtyQ",
  authDomain: "the-latin-barbers-club.firebaseapp.com",
  projectId: "the-latin-barbers-club",
  storageBucket: "the-latin-barbers-club.firebasestorage.app",
  messagingSenderId: "437962623142",
  appId: "1:437962623142:web:f081cd9fcbda511e904c67"
};

const app = initializeApp(firebaseConfig);
export const db = getFirestore(app);
