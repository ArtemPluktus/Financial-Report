import { initializeApp } from "firebase/app";
import { getFirestore } from "firebase/firestore";

const firebaseConfig = {
  apiKey: "AIzaSyAQnGCGQuQ6G_v7RBRR4qJdeHFtLf3JoQo",
  authDomain: "financial-report-7e6a4.firebaseapp.com",
  projectId: "financial-report-7e6a4",
  storageBucket: "financial-report-7e6a4.appspot.com",
  messagingSenderId: "300425455869",
  appId: "1:300425455869:web:b51b66ae5b8fc6999e3694",
  measurementId: "G-XWL2SL5NK8"
};

const app = initializeApp(firebaseConfig);
export const db = getFirestore(app);