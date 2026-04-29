import { 
  getAuth, 
  createUserWithEmailAndPassword,
  signInWithPopup, 
  signInWithEmailAndPassword,
  GoogleAuthProvider, 
  OAuthProvider,
  signOut, 
  onAuthStateChanged,
  User 
} from 'firebase/auth';
import { getFirebaseApp } from './firebase';

type FirebaseAuth = ReturnType<typeof getAuth>;

let cachedAuth: FirebaseAuth | null = null;
let cachedGoogleProvider: GoogleAuthProvider | null = null;
let cachedKakaoProvider: OAuthProvider | null = null;

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

function getKakaoProvider() {
  if (!cachedKakaoProvider) {
    const providerId = process.env.NEXT_PUBLIC_FIREBASE_KAKAO_PROVIDER_ID || 'oidc.kakao';
    cachedKakaoProvider = new OAuthProvider(providerId);
    cachedKakaoProvider.setCustomParameters({
      prompt: 'login',
    });
  }

  return cachedKakaoProvider;
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

export const signInWithKakao = async () => {
  try {
    const result = await signInWithPopup(getClientAuth(), getKakaoProvider());
    return result.user;
  } catch (error) {
    console.error('Error signing in with Kakao:', error);
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
