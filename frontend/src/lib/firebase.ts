import { initializeApp, getApps, getApp } from 'firebase/app';
import { getAuth, connectAuthEmulator } from 'firebase/auth';
import { getFirestore, connectFirestoreEmulator } from 'firebase/firestore';
import { getStorage, connectStorageEmulator } from 'firebase/storage';
import { getFunctions, connectFunctionsEmulator } from 'firebase/functions';

// Firebase configuration
const firebaseConfig = {
  apiKey: process.env.NEXT_PUBLIC_FIREBASE_API_KEY,
  authDomain: process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN,
  projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID,
  storageBucket: process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: process.env.NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID,
  appId: process.env.NEXT_PUBLIC_FIREBASE_APP_ID,
  measurementId: process.env.NEXT_PUBLIC_FIREBASE_MEASUREMENT_ID,
};

// Validate configuration
const requiredConfigKeys = [
  'NEXT_PUBLIC_FIREBASE_API_KEY',
  'NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN',
  'NEXT_PUBLIC_FIREBASE_PROJECT_ID',
  'NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET',
  'NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID',
  'NEXT_PUBLIC_FIREBASE_APP_ID',
];

const missingKeys = requiredConfigKeys.filter(key => !process.env[key]);
if (missingKeys.length > 0) {
  throw new Error(
    `Missing required Firebase configuration keys: ${missingKeys.join(', ')}`
  );
}

// Initialize Firebase app (singleton pattern) - only if config is available
let app: any = null;
let auth: any = null;
let db: any = null;
let storage: any = null;
let functions: any = null;

// Only initialize if we have the basic required config
if (firebaseConfig.apiKey && firebaseConfig.projectId) {
  app = getApps().length === 0 ? initializeApp(firebaseConfig) : getApp();
  
  // Initialize Firebase services
  auth = getAuth(app);
  db = getFirestore(app);
  storage = getStorage(app);
  functions = getFunctions(app, 'europe-west1'); // Use European region
}

export { auth, db, storage, functions };

// Connect to emulators in development (only if Firebase is configured)
if (process.env.NODE_ENV === 'development' && auth && db && storage && functions) {
  const isEmulator = () => {
    try {
      // Check if we're running with emulators
      return process.env.NEXT_PUBLIC_ENV === 'development' && 
             typeof window !== 'undefined' && 
             window.location.hostname === 'localhost';
    } catch (error) {
      return false;
    }
  };

  if (isEmulator()) {
    // Connect to emulators only once
    try {
      connectAuthEmulator(auth, 'http://localhost:9099', { disableWarnings: true });
    } catch (error) {
      // Auth emulator already connected
    }

    try {
      connectFirestoreEmulator(db, 'localhost', 8080);
    } catch (error) {
      // Firestore emulator already connected
    }

    try {
      connectStorageEmulator(storage, 'localhost', 9199);
    } catch (error) {
      // Storage emulator already connected
    }

    try {
      connectFunctionsEmulator(functions, 'localhost', 5001);
    } catch (error) {
      // Functions emulator already connected
    }
  }
}

// Export the app instance
export default app;

// Helper function to check if Firebase is properly configured
export const isFirebaseConfigured = () => {
  return !!(firebaseConfig.apiKey && firebaseConfig.projectId && app);
};

// Export configuration for debugging
export const firebaseConfigDebug = {
  projectId: firebaseConfig.projectId,
  authDomain: firebaseConfig.authDomain,
  storageBucket: firebaseConfig.storageBucket,
  isConfigured: isFirebaseConfigured(),
  environment: process.env.NODE_ENV,
}; 