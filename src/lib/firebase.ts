
import { initializeApp, getApps, getApp } from 'firebase/app';
import { getAuth } from 'firebase/auth';

// User-provided Firebase configuration
const firebaseConfig = {
  apiKey: "AIzaSyC-r0hNTUZ2LbHBYCHjs2B6fbXa3oWIkxc",
  authDomain: "homeplate-r14jn.firebaseapp.com",
  projectId: "homeplate-r14jn",
  storageBucket: "homeplate-r14jn.appspot.com", // Corrected from .firebasestorage.app, .appspot.com is typical for storageBucket
  messagingSenderId: "821509879437",
  appId: "1:821509879437:web:c8ff8a35b84d53ca5e54c4"
};

// Initialize Firebase
let app;
if (getApps().length === 0) {
  app = initializeApp(firebaseConfig);
} else {
  app = getApp();
}

const auth = getAuth(app);

export { app, auth };
