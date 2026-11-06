import { initializeApp } from "https://www.gstatic.com/firebasejs/10.8.0/firebase-app.js";
import { getFirestore } from "https://www.gstatic.com/firebasejs/10.8.0/firebase-firestore.js";
import { getAuth } from "https://www.gstatic.com/firebasejs/10.8.0/firebase-auth.js";

const firebaseConfig = {
  apiKey: "AIzaSyAl5IUFg3MeAI5aEX2KiHyXXqD_H2BSEKs",
  authDomain: "sizu-531d5.firebaseapp.com",
  projectId: "sizu-531d5",
  storageBucket: "sizu-531d5.firebasestorage.app",
  messagingSenderId: "430408867372",
  appId: "1:430408867372:web:5cb728911be3c9560f3b89"
};

const app = initializeApp(firebaseConfig);
export const db = getFirestore(app);
export const auth = getAuth(app);