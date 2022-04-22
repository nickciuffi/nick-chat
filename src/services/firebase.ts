import {initializeApp} from "firebase/app";
import {getDatabase, ref, set, get, child, push, onValue} from "firebase/database";
import {getAuth, GoogleAuthProvider, signInWithPopup} from "firebase/auth";
// TODO: Add SDKs for Firebase products that you want to use
// https://firebase.google.com/docs/web/setup#available-libraries

// Your web app's Firebase configuration
const firebaseConfig = {
  apiKey: "AIzaSyAXaW_KoFR7eAu90DIHzLeA0pVZB4YLhK0",
  authDomain: "whatsapp2-a9c9a.firebaseapp.com",
  projectId: "whatsapp2-a9c9a",
  storageBucket: "whatsapp2-a9c9a.appspot.com",
  messagingSenderId: "297481960600",
  appId: "1:297481960600:web:8d6feeb4725a8697d1a4ed"
};

// Initialize Firebase
initializeApp(firebaseConfig);
const auth = getAuth()

const database = getDatabase();



export {auth, database, ref, set, get, child,push, onValue, GoogleAuthProvider, signInWithPopup}