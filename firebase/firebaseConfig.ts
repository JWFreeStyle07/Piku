// Import the functions you need from the SDKs you need
import { getApp, getApps, initializeApp } from "firebase/app";
import { getAuth } from 'firebase/auth';
import { getFirestore } from 'firebase/firestore';
import { getStorage } from 'firebase/storage';

// Your web app's Firebase configuration
const firebaseConfig = {
  apiKey: "AIzaSyAFVoinHF5fALPPYGe4PjcZAabM17NYcyk",
  authDomain: "piku-850b1.firebaseapp.com",
  projectId: "piku-850b1",
  storageBucket: "piku-850b1.firebasestorage.app",
  messagingSenderId: "186843965706",
  appId: "1:186843965706:web:2d03d2668d495600beb2f3",
  measurementId: "G-JJ610Z8L84"
};

// Initialize Firebase - check if already initialized
const app = getApps().length === 0 ? initializeApp(firebaseConfig) : getApp();

// Initialize Firebase services (NO ANALYTICS - not supported in React Native)
export const auth = getAuth(app);
export const db = getFirestore(app);
export const storage = getStorage(app);

export default app;