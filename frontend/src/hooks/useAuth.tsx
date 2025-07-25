'use client';

import { useState, useEffect, useContext, createContext, ReactNode } from 'react';
import {
  User as FirebaseUser,
  signInWithPopup,
  signInWithEmailAndPassword,
  createUserWithEmailAndPassword,
  sendPasswordResetEmail,
  updateProfile,
  GoogleAuthProvider,
  signOut,
  onAuthStateChanged,
  UserCredential,
} from 'firebase/auth';
import { doc, getDoc, setDoc, updateDoc, serverTimestamp } from 'firebase/firestore';
import { auth, db } from '@/lib/firebase';
import { User, UserRole, SubscriptionTier } from '@/types';
import toast from 'react-hot-toast';

// Helper function to check if we're in a browser environment
function isBrowser(): boolean {
  return typeof window !== 'undefined';
}

interface AuthContextType {
  user: User | null;
  firebaseUser: FirebaseUser | null;
  loading: boolean;
  error: string | null;
  signInWithGoogle: () => Promise<void>;
  signInWithEmail: (email: string, password: string) => Promise<void>;
  signUpWithEmail: (email: string, password: string, displayName?: string) => Promise<void>;
  resetPassword: (email: string) => Promise<void>;
  logout: () => Promise<void>;
  updateUserProfile: (updates: Partial<User>) => Promise<void>;
  refreshUser: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const useAuth = (): AuthContextType => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

interface AuthProviderProps {
  children: ReactNode;
}

export const AuthProvider = ({ children }: AuthProviderProps) => {
  const [user, setUser] = useState<User | null>(null);
  const [firebaseUser, setFirebaseUser] = useState<FirebaseUser | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Initialize Google Auth Provider only in browser
  const getGoogleProvider = () => {
    if (!isBrowser()) return null;
    const googleProvider = new GoogleAuthProvider();
    googleProvider.addScope('email');
    googleProvider.addScope('profile');
    return googleProvider;
  };

  // Create or update user profile in Firestore
  const createUserProfile = async (firebaseUser: FirebaseUser): Promise<User> => {
    if (!isBrowser() || !db) {
      throw new Error('Database not available');
    }

    const userRef = doc(db, 'users', firebaseUser.uid);
    const userSnap = await getDoc(userRef);

    if (userSnap.exists()) {
      // Update existing user's last login
      await updateDoc(userRef, {
        lastLoginAt: serverTimestamp(),
        photoURL: firebaseUser.photoURL,
        displayName: firebaseUser.displayName,
      });
      return userSnap.data() as User;
    } else {
      // Create new user profile
      const newUser: Omit<User, 'uid'> = {
        email: firebaseUser.email!,
        displayName: firebaseUser.displayName || '',
        photoURL: firebaseUser.photoURL || '',
        role: 'individual' as UserRole,
        subscription: 'free' as SubscriptionTier,
        createdAt: serverTimestamp() as any,
        updatedAt: serverTimestamp() as any,
        settings: {
          language: 'nl',
          notifications: {
            email: true,
            browser: true,
            applicationUpdates: true,
            teamUpdates: true,
          },
          ui: {
            theme: 'auto',
            compactMode: false,
          },
        },
      };

      await setDoc(userRef, newUser);
      
      // Return the created user with uid
      return {
        uid: firebaseUser.uid,
        ...newUser,
      } as User;
    }
  };

  // Fetch user profile from Firestore
  const fetchUserProfile = async (firebaseUser: FirebaseUser): Promise<User | null> => {
    if (!isBrowser() || !db) return null;
    
    try {
      const userRef = doc(db, 'users', firebaseUser.uid);
      const userSnap = await getDoc(userRef);
      
      if (userSnap.exists()) {
        return { uid: firebaseUser.uid, ...userSnap.data() } as User;
      }
      
      return null;
    } catch (error) {
      console.error('Error fetching user profile:', error);
      return null;
    }
  };

  // Sign in with Google
  const signInWithGoogle = async (): Promise<void> => {
    if (!isBrowser() || !auth) {
      toast.error('Authentication not available');
      return;
    }

    const googleProvider = getGoogleProvider();
    if (!googleProvider) {
      toast.error('Google authentication not available');
      return;
    }

    try {
      setLoading(true);
      setError(null);
      
      const result: UserCredential = await signInWithPopup(auth, googleProvider);
      const firebaseUser = result.user;
      
      if (firebaseUser) {
        const userProfile = await createUserProfile(firebaseUser);
        setUser(userProfile);
        
        toast.success(`Welcome ${userProfile.displayName || userProfile.email}!`);
      }
    } catch (error: any) {
      console.error('Error signing in with Google:', error);
      setError(error.message || 'Failed to sign in with Google');
      toast.error('Failed to sign in. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  // Sign in with Email/Password
  const signInWithEmail = async (email: string, password: string): Promise<void> => {
    if (!isBrowser() || !auth) {
      toast.error('Authentication not available');
      return;
    }

    try {
      setLoading(true);
      setError(null);
      
      const result: UserCredential = await signInWithEmailAndPassword(auth, email, password);
      const firebaseUser = result.user;
      
      if (firebaseUser) {
        const userProfile = await fetchUserProfile(firebaseUser) || await createUserProfile(firebaseUser);
        setUser(userProfile);
        
        toast.success(`Welcome back ${userProfile.displayName || userProfile.email}!`);
      }
    } catch (error: any) {
      console.error('Error signing in with email:', error);
      let errorMessage = 'Failed to sign in. Please try again.';
      
      if (error.code === 'auth/user-not-found') {
        errorMessage = 'No account found with this email address.';
      } else if (error.code === 'auth/wrong-password') {
        errorMessage = 'Incorrect password. Please try again.';
      } else if (error.code === 'auth/invalid-email') {
        errorMessage = 'Invalid email address.';
      }
      
      setError(errorMessage);
      toast.error(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  // Sign up with Email/Password
  const signUpWithEmail = async (email: string, password: string, displayName?: string): Promise<void> => {
    if (!isBrowser() || !auth) {
      toast.error('Authentication not available');
      return;
    }

    try {
      setLoading(true);
      setError(null);
      
      const result: UserCredential = await createUserWithEmailAndPassword(auth, email, password);
      const firebaseUser = result.user;
      
      if (firebaseUser) {
        // Update display name if provided
        if (displayName) {
          await updateProfile(firebaseUser, { displayName });
        }
        
        const userProfile = await createUserProfile(firebaseUser);
        if (displayName) {
          userProfile.displayName = displayName;
          await updateUserProfile({ displayName });
        }
        
        setUser(userProfile);
        toast.success(`Welcome to WBSO Simpel, ${displayName || email}!`);
      }
    } catch (error: any) {
      console.error('Error signing up with email:', error);
      let errorMessage = 'Failed to create account. Please try again.';
      
      if (error.code === 'auth/email-already-in-use') {
        errorMessage = 'An account with this email already exists.';
      } else if (error.code === 'auth/weak-password') {
        errorMessage = 'Password should be at least 6 characters.';
      } else if (error.code === 'auth/invalid-email') {
        errorMessage = 'Invalid email address.';
      }
      
      setError(errorMessage);
      toast.error(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  // Reset Password
  const resetPassword = async (email: string): Promise<void> => {
    if (!isBrowser() || !auth) {
      toast.error('Authentication not available');
      return;
    }

    try {
      setLoading(true);
      setError(null);
      
      await sendPasswordResetEmail(auth, email);
      toast.success('Password reset email sent! Check your inbox.');
    } catch (error: any) {
      console.error('Error sending password reset email:', error);
      let errorMessage = 'Failed to send reset email. Please try again.';
      
      if (error.code === 'auth/user-not-found') {
        errorMessage = 'No account found with this email address.';
      } else if (error.code === 'auth/invalid-email') {
        errorMessage = 'Invalid email address.';
      }
      
      setError(errorMessage);
      toast.error(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  // Sign out
  const logout = async (): Promise<void> => {
    if (!isBrowser() || !auth) {
      toast.error('Authentication not available');
      return;
    }

    try {
      setLoading(true);
      await signOut(auth);
      setUser(null);
      setFirebaseUser(null);
      toast.success('Successfully signed out');
    } catch (error: any) {
      console.error('Error signing out:', error);
      setError(error.message || 'Failed to sign out');
      toast.error('Failed to sign out. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  // Update user profile
  const updateUserProfile = async (updates: Partial<User>): Promise<void> => {
    if (!isBrowser() || !db) {
      toast.error('Database not available');
      return;
    }
    if (!user) throw new Error('No user logged in');
    
    try {
      setLoading(true);
      const userRef = doc(db, 'users', user.uid);
      
      const updateData = {
        ...updates,
        updatedAt: serverTimestamp(),
      };
      
      await updateDoc(userRef, updateData);
      
      // Update local state
      setUser(prev => prev ? { ...prev, ...updates } : null);
      
      toast.success('Profile updated successfully');
    } catch (error: any) {
      console.error('Error updating user profile:', error);
      setError(error.message || 'Failed to update profile');
      toast.error('Failed to update profile. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  // Refresh user data from Firestore
  const refreshUser = async (): Promise<void> => {
    if (!firebaseUser) return;
    
    try {
      const userProfile = await fetchUserProfile(firebaseUser);
      if (userProfile) {
        setUser(userProfile);
      }
    } catch (error: any) {
      console.error('Error refreshing user:', error);
      setError(error.message || 'Failed to refresh user data');
    }
  };

  // Listen to Firebase Auth state changes
  useEffect(() => {
    // Only run in browser environment
    if (!isBrowser()) {
      console.log('🔥 Running in SSR mode - skipping Firebase Auth initialization');
      setLoading(false);
      return;
    }

    // If Firebase is not available, just set loading to false
    if (!auth) {
      console.log('🔥 Firebase Auth not available - running in demo mode');
      setLoading(false);
      return;
    }

    const unsubscribe = onAuthStateChanged(auth, async (firebaseUser) => {
      setLoading(true);
      setError(null);
      
      try {
        if (firebaseUser) {
          setFirebaseUser(firebaseUser);
          const userProfile = await fetchUserProfile(firebaseUser);
          
          if (userProfile) {
            setUser(userProfile);
          } else {
            // User exists in Firebase Auth but not in Firestore
            const newUserProfile = await createUserProfile(firebaseUser);
            setUser(newUserProfile);
          }
        } else {
          setFirebaseUser(null);
          setUser(null);
        }
      } catch (error: any) {
        console.error('Auth state change error:', error);
        setError(error.message || 'Authentication error');
      } finally {
        setLoading(false);
      }
    });

    return () => unsubscribe();
  }, []);

  const value: AuthContextType = {
    user,
    firebaseUser,
    loading,
    error,
    signInWithGoogle,
    signInWithEmail,
    signUpWithEmail,
    resetPassword,
    logout,
    updateUserProfile,
    refreshUser,
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
};

export default useAuth; 