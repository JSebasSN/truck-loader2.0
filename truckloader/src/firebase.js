import { initializeApp } from "firebase/app";
import { getAuth } from "firebase/auth";
import { getFirestore } from "firebase/firestore";

const firebaseConfig = {
  apiKey: "AIzaSyAgz6ytEJiGJH5d5cWmKNb-Oo3msg8HrDM",
  authDomain: "truckloader-b0908.firebaseapp.com",
  projectId: "truckloader-b0908",
  storageBucket: "truckloader-b0908.firebasestorage.app",
  messagingSenderId: "898132463344",
  appId: "1:898132463344:web:04d77f59d921dba7c6bc35",
  measurementId: "G-SBQWH1BZEF"
};

const app = initializeApp(firebaseConfig);
export const auth = getAuth(app);
export const db = getFirestore(app);
export default app;
