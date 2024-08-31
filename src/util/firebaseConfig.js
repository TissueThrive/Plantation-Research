// Import the functions you need from the SDKs you need
import { initializeApp } from "firebase/app";
import { getAuth } from "firebase/auth";
import { getFirestore } from "firebase/firestore";
import { getStorage } from "firebase/storage";
// TODO: Add SDKs for Firebase products that you want to use
// https://firebase.google.com/docs/web/setup#available-libraries

// Your web app's Firebase configuration
const firebaseConfig = {
  apiKey: "AIzaSyCvBxfbzS1JBu0dWgMnI8HGRo6viU1Nai4",
  authDomain: "tissue-thrive.firebaseapp.com",
  projectId: "tissue-thrive",
  storageBucket: "tissue-thrive.appspot.com",
  messagingSenderId: "544493797239",
  appId: "1:544493797239:web:13d364b11b6158a5c1eb72",
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);

// Initialize Firebase Authentication and get a reference to the service
export const auth = getAuth(app);
export const db = getFirestore(app);
export const storage = getStorage(app);

export default app;
