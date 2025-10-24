import { initializeApp, getApps, getApp, type FirebaseApp } from 'firebase/app';
import { getFirestore } from 'firebase/firestore';
import { getAuth } from 'firebase/auth';

// Your web app's Firebase configuration
const firebaseConfig = {
  apiKey: "AIzaSyCtIyRpcWhMgqC__uCS5dxSpuvgWYc3h5U",
  authDomain: "lecatex-ca042.firebaseapp.com",
  projectId: "lecatex-ca042",
  storageBucket: "lecatex-ca042.appspot.com",
  messagingSenderId: "316458364732",
  appId: "1:316458364732:web:87a9ea1893844418403839"
};

// Initialize Firebase
let app: FirebaseApp;
if (!getApps().length) {
  app = initializeApp(firebaseConfig);
} else {
  app = getApp();
}

const db = getFirestore(app);
const auth = getAuth(app);

export { db, auth, app };
