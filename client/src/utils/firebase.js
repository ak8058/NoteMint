import { initializeApp } from "firebase/app";
import {getAuth, GoogleAuthProvider} from "firebase/auth"

const firebaseConfig = {
  apiKey: "AIzaSyA7u1gJxIMdCzkcmUeFT4EeeLGE7d9Lt9Q",
  authDomain: "notemint-28e94.firebaseapp.com",
  projectId: "notemint-28e94",
  storageBucket: "notemint-28e94.firebasestorage.app",
  messagingSenderId: "297938978887",
  appId: "1:297938978887:web:27d214dc71f456e1d28962",
  measurementId: "G-E4P7NRVYE5",
};

const app = initializeApp(firebaseConfig);

const auth=getAuth(app)

const provider=new GoogleAuthProvider()

export {auth,provider}