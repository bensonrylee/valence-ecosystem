import {
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
  signOut,
  sendPasswordResetEmail,
  sendEmailVerification,
  updateProfile,
  GoogleAuthProvider,
  signInWithPopup,
  User,
  onAuthStateChanged,
} from 'firebase/auth';
import { auth, db } from './firebase/config';
import { doc, setDoc, getDoc, updateDoc } from 'firebase/firestore';

export interface UserProfile {
  uid: string;
  email: string;
  displayName: string;
  photoURL?: string;
  role: 'customer' | 'provider' | 'admin';
  createdAt: Date;
  updatedAt: Date;
  emailVerified: boolean;
  phoneNumber?: string;
  bio?: string;
  location?: string;
  settings?: {
    notifications: boolean;
    marketing: boolean;
    twoFactor: boolean;
  };
}

class AuthService {
  private googleProvider = new GoogleAuthProvider();

  // Sign up with email and password
  async signUp(email: string, password: string, displayName: string) {
    try {
      const userCredential = await createUserWithEmailAndPassword(auth, email, password);
      const user = userCredential.user;

      // Update display name
      await updateProfile(user, { displayName });

      // Send verification email
      await sendEmailVerification(user);

      // Create user profile in Firestore
      await this.createUserProfile(user, { displayName });

      return { user, error: null };
    } catch (error: any) {
      return { user: null, error: error.message };
    }
  }

  // Sign in with email and password
  async signIn(email: string, password: string) {
    try {
      const userCredential = await signInWithEmailAndPassword(auth, email, password);
      return { user: userCredential.user, error: null };
    } catch (error: any) {
      return { user: null, error: error.message };
    }
  }

  // Sign in with Google
  async signInWithGoogle() {
    try {
      const result = await signInWithPopup(auth, this.googleProvider);
      const user = result.user;

      // Check if user profile exists, create if not
      const profileDoc = await getDoc(doc(db, 'users', user.uid));
      if (!profileDoc.exists()) {
        await this.createUserProfile(user);
      }

      return { user, error: null };
    } catch (error: any) {
      return { user: null, error: error.message };
    }
  }

  // Sign out
  async signOut() {
    try {
      await signOut(auth);
      return { error: null };
    } catch (error: any) {
      return { error: error.message };
    }
  }

  // Reset password
  async resetPassword(email: string) {
    try {
      await sendPasswordResetEmail(auth, email);
      return { error: null };
    } catch (error: any) {
      return { error: error.message };
    }
  }

  // Create user profile in Firestore
  private async createUserProfile(user: User, additionalData?: Partial<UserProfile>) {
    const userProfile: UserProfile = {
      uid: user.uid,
      email: user.email!,
      displayName: user.displayName || additionalData?.displayName || '',
      photoURL: user.photoURL || undefined,
      role: 'customer',
      createdAt: new Date(),
      updatedAt: new Date(),
      emailVerified: user.emailVerified,
      settings: {
        notifications: true,
        marketing: true,
        twoFactor: false,
      },
      ...additionalData,
    };

    await setDoc(doc(db, 'users', user.uid), userProfile);
    return userProfile;
  }

  // Get user profile
  async getUserProfile(uid: string): Promise<UserProfile | null> {
    try {
      const docSnap = await getDoc(doc(db, 'users', uid));
      if (docSnap.exists()) {
        return docSnap.data() as UserProfile;
      }
      return null;
    } catch (error) {
      console.error('Error fetching user profile:', error);
      return null;
    }
  }

  // Update user profile
  async updateUserProfile(uid: string, updates: Partial<UserProfile>) {
    try {
      await updateDoc(doc(db, 'users', uid), {
        ...updates,
        updatedAt: new Date(),
      });
      return { error: null };
    } catch (error: any) {
      return { error: error.message };
    }
  }

  // Auth state observer
  onAuthStateChanged(callback: (user: User | null) => void) {
    return onAuthStateChanged(auth, callback);
  }

  // Get current user
  getCurrentUser() {
    return auth.currentUser;
  }
}

export const authService = new AuthService();
export default authService;