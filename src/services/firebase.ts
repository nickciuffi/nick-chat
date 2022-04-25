import {initializeApp} from "firebase/app";
import {getAuth, GoogleAuthProvider, signInWithPopup, signOut} from "firebase/auth";
import {getStorage, ref as refStorage, uploadBytes, getDownloadURL} from 'firebase/storage';
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
const firebaseApp = initializeApp(firebaseConfig);
const auth = getAuth(firebaseApp)
const storage = getStorage()



export {auth, signOut, database, ref, set, get, child,push, onValue, GoogleAuthProvider, signInWithPopup, storage, refStorage, uploadBytes, getDownloadURL}