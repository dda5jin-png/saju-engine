import { 
  getAuth, 
  createUserWithEmailAndPassword,
  signInWithPopup, 
  signInWithEmailAndPassword,
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
    cachedGoogleProvider.setCustomParameters({
      prompt: 'select_account',
    });
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

export const signInWithPersonalEmail = async (email: string, password: string) => {
  const result = await signInWithEmailAndPassword(getClientAuth(), email, password);
  return result.user;
};

export const createPersonalEmailAccount = async (email: string, password: string) => {
  const result = await createUserWithEmailAndPassword(getClientAuth(), email, password);
  return result.user;
};

export const logout = () => signOut(getClientAuth());

export const subscribeToAuthChanges = (callback: (user: User | null) => void) => {
  return onAuthStateChanged(getClientAuth(), callback);
};
