
import { initializeApp, getApps, getApp } from 'firebase/app';
import { getAuth } from 'firebase/auth';

const firebaseConfig = {
  apiKey: process.env.NEXT_PUBLIC_FIREBASE_API_KEY,
  authDomain: process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN,
  projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID,
  storageBucket: process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: process.env.NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID,
  appId: process.env.NEXT_PUBLIC_FIREBASE_APP_ID,
};

// Check if the API key is present BEFORE initializing
if (!firebaseConfig.apiKey) {
  console.error(
    "Firebase API Key is missing from environment variables. " +
    "Please ensure your .env.local file is correctly set up with NEXT_PUBLIC_FIREBASE_API_KEY " +
    "and that you have restarted your Next.js development server."
  );
}

// Initialize Firebase
let app;
if (getApps().length === 0) {
  app = initializeApp(firebaseConfig);
} else {
  app = getApp();
}

const auth = getAuth(app);

export { app, auth };
