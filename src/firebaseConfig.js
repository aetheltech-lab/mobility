import { initializeApp } from "firebase/app";
import { getFirestore } from "firebase/firestore";

const firebaseConfig = {
    apiKey: "AIzaSyBwhzGsK-ah7ObMOgpRDlzGghycLNinm6g",
    authDomain: "tforce-guardian-system.firebaseapp.com",
    projectId: "tforce-guardian-system",
    storageBucket: "tforce-guardian-system.firebasestorage.app",
    messagingSenderId: "194168927826",
    appId: "1:194168927826:web:18073e1a188b8e4408118b"
};

const app = initializeApp(firebaseConfig);
// We only need Firestore for the customer app to read/write fleet status
export const db = getFirestore(app);