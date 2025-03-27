import { getApp, getApps, initializeApp } from "firebase/app";
import { getAuth } from "firebase/auth";
import { getFirestore } from "firebase/firestore";

const firebaseConfig = {
  apiKey: "AIzaSyCg7_xPzTNSK4IwIgELcO3IS5Hp08C47nI",
  authDomain: "prepwise-88f51.firebaseapp.com",
  projectId: "prepwise-88f51",
  storageBucket: "prepwise-88f51.firebasestorage.app",
  messagingSenderId: "1049544352538",
  appId: "1:1049544352538:web:e1ce9cb9de7ee0a30642a3",
  measurementId: "G-TFTFB0YHKJ",
};

// Initialize Firebase
const app = !getApps().length ? initializeApp(firebaseConfig) : getApp();

export const auth = getAuth(app);
export const db = getFirestore(app);
