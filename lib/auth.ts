import { 
  getAuth, 
  signInWithPopup, 
  GoogleAuthProvider, 
  signOut, 
  onAuthStateChanged,
  User 
} from 'firebase/auth';
import { getFirebaseApp } from './firebase';

type FirebaseAuth = ReturnType<typeof getAuth>;

let cachedAuth: FirebaseAuth | null = null;
let cachedGoogleProvider: GoogleAuthProvider | null = null;

export function getClientAuth() {
  if (!cachedAuth) {
    cachedAuth = getAuth(getFirebaseApp());
  }

  return cachedAuth;
}

function getGoogleProvider() {
  if (!cachedGoogleProvider) {
    cachedGoogleProvider = new GoogleAuthProvider();
  }

  return cachedGoogleProvider;
}

export const signInWithGoogle = async () => {
  try {
    const result = await signInWithPopup(getClientAuth(), getGoogleProvider());
    return result.user;
  } catch (error) {
    console.error('Error signing in with Google:', error);
    throw error;
  }
};

export const logout = () => signOut(getClientAuth());

export const subscribeToAuthChanges = (callback: (user: User | null) => void) => {
  return onAuthStateChanged(getClientAuth(), callback);
};
