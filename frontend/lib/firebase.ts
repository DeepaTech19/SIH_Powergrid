import { initializeApp, getApps } from 'firebase/app';
import { getAuth } from 'firebase/auth';

const firebaseConfig = {
  apiKey: "AIzaSyBlBoR3z2vc-cnox7n3gsZYfiUY3jnUM2g",
  authDomain: "powergrid-f6fb7.firebaseapp.com",
  projectId: "powergrid-f6fb7",
  storageBucket: "powergrid-f6fb7.firebasestorage.app",
  messagingSenderId: "276511323418",
  appId: "1:276511323418:web:852ea3fbb40e7bbd9228a3",
  measurementId: "G-F48PGP6Q8P"
};

// Initialize Firebase
const app = getApps().length === 0 ? initializeApp(firebaseConfig) : getApps()[0];
const auth = getAuth(app);

export { app, auth };
